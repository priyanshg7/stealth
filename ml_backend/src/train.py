import os
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import autocast, GradScaler
import wandb
from tqdm import tqdm
import time

from config import ModelConfig
from dataset import get_dataloaders
from augmentations import get_training_augmentation, get_validation_augmentation
from models import DiseaseClassifier

# Define Focal Loss + Label Smoothing
class FocalLoss(nn.Module):
    def __init__(self, alpha=1, gamma=2, label_smoothing=0.1):
        super(FocalLoss, self).__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.ce = nn.CrossEntropyLoss(label_smoothing=label_smoothing, reduction='none')

    def forward(self, inputs, targets):
        ce_loss = self.ce(inputs, targets)
        pt = torch.exp(-ce_loss)
        focal_loss = self.alpha * (1 - pt) ** self.gamma * ce_loss
        return focal_loss.mean()

def train_epoch(model, dataloader, criterion, optimizer, scaler, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    pbar = tqdm(dataloader, desc="Training")
    for inputs, labels in pbar:
        inputs, labels = inputs.to(device), labels.to(device)
        
        optimizer.zero_grad()
        
        # Mixed Precision Training
        with autocast():
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()
        
        running_loss += loss.item()
        
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
        
        pbar.set_postfix({'loss': running_loss/total, 'acc': 100.*correct/total})
        
    epoch_loss = running_loss / len(dataloader)
    epoch_acc = 100. * correct / total
    return epoch_loss, epoch_acc

def validate_epoch(model, dataloader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    # Store predictions for F1, Precision, Recall calculations
    all_preds = []
    all_targets = []
    
    with torch.no_grad():
        pbar = tqdm(dataloader, desc="Validation")
        for inputs, labels in pbar:
            inputs, labels = inputs.to(device), labels.to(device)
            
            with autocast():
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                
            running_loss += loss.item()
            
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            all_preds.extend(predicted.cpu().numpy())
            all_targets.extend(labels.cpu().numpy())
            
    epoch_loss = running_loss / len(dataloader)
    epoch_acc = 100. * correct / total
    
    # Optional: Calculate Precision/Recall/F1 here using sklearn
    from sklearn.metrics import precision_recall_fscore_support
    precision, recall, f1, _ = precision_recall_fscore_support(
        all_targets, all_preds, average='macro', zero_division=0
    )
    
    return epoch_loss, epoch_acc, precision, recall, f1

def train(config_path):
    config = ModelConfig.from_yaml(config_path)
    
    # Initialize WandB
    try:
        wandb.init(project="kisanmitra-disease-diagnosis", config=config.__dict__)
    except Exception as e:
        print("WandB login not found. Falling back to offline tracking mode.")
        os.environ["WANDB_MODE"] = "offline"
        wandb.init(project="kisanmitra-disease-diagnosis", config=config.__dict__, mode="offline")
    
    os.makedirs(config.checkpoint_dir, exist_ok=True)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Get Augmentations
    train_transform = get_training_augmentation(config.image_size)
    val_transform = get_validation_augmentation(config.image_size)
    
    # Get DataLoaders
    train_loader, val_loader, test_loader, class_idx = get_dataloaders(
        config, train_transform, val_transform
    )
    print(f"Class mapping: {class_idx}")
    
    # Save the original class_to_idx mapping during training as class_mapping.json for every crop model.
    import json
    metadata_dir = "models/metadata"
    os.makedirs(metadata_dir, exist_ok=True)
    mapping_path = os.path.join(metadata_dir, f"{config.crop.lower()}_class_mapping.json")
    with open(mapping_path, 'w') as f:
        json.dump(class_idx, f, indent=4)
    print(f"Saved class mapping to {mapping_path}")
    
    # Initialize Model
    model = DiseaseClassifier(
        architecture=config.model_architecture,
        num_classes=config.num_classes,
        pretrained=config.pretrained,
        freeze_backbone=True # Phase 1: Train Head only
    ).to(device)
    
    # Loss, Optimizer, Scheduler
    criterion = FocalLoss(label_smoothing=0.0)
    optimizer = optim.AdamW(model.parameters(), lr=config.learning_rate, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=config.epochs)
    scaler = GradScaler()
    
    best_val_f1 = 0.0
    patience = 10
    patience_counter = 0
    
    for epoch in range(config.epochs):
        print(f"\nEpoch {epoch+1}/{config.epochs}")
        
        # Unfreeze backbone halfway through if training head first
        if epoch == 5:
            print("Unfreezing backbone for fine-tuning...")
            model.unfreeze_all()
            # Adjust learning rate for fine-tuning
            for param_group in optimizer.param_groups:
                param_group['lr'] = config.learning_rate * 0.1
        
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, scaler, device)
        val_loss, val_acc, val_prec, val_rec, val_f1 = validate_epoch(model, val_loader, criterion, device)
        
        scheduler.step()
        
        wandb.log({
            "epoch": epoch + 1,
            "train_loss": train_loss,
            "train_acc": train_acc,
            "val_loss": val_loss,
            "val_acc": val_acc,
            "val_precision": val_prec,
            "val_recall": val_rec,
            "val_f1": val_f1,
            "lr": optimizer.param_groups[0]['lr']
        })
        
        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}% | Val F1: {val_f1:.4f}")
        
        # Early Stopping and Checkpointing
        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            patience_counter = 0
            checkpoint_path = os.path.join(config.checkpoint_dir, f"best_model.pth")
            torch.save(model.state_dict(), checkpoint_path)
            print(f"Saved best model with F1: {best_val_f1:.4f}")
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print("Early stopping triggered.")
                break
                
    wandb.finish()
    print("Training complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, required=True, help="Path to crop yaml config")
    args = parser.parse_args()
    
    train(args.config)
