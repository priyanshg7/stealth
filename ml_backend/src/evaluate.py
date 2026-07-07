import argparse
import os
import torch
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report
from torch.cuda.amp import autocast
from tqdm import tqdm

from config import ModelConfig
from dataset import get_dataloaders
from augmentations import get_validation_augmentation
from models import DiseaseClassifier

def evaluate(config_path, checkpoint_path):
    config = ModelConfig.from_yaml(config_path)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Load test dataloader (or val if test doesn't exist)
    val_transform = get_validation_augmentation(config.image_size)
    
    # For evaluation, we map the val_transform to test_transform in this helper
    _, _, test_loader, class_idx = get_dataloaders(
        config, train_transform=None, val_transform=val_transform, test_transform=val_transform
    )
    
    if test_loader is None:
        print("Test split not found, falling back to val loader...")
        _, test_loader, _, class_idx = get_dataloaders(
            config, train_transform=None, val_transform=val_transform
        )
        
    idx_to_class = {v: k for k, v in class_idx.items()}
    class_names = [idx_to_class[i] for i in range(len(idx_to_class))]
    
    # Load Model
    model = DiseaseClassifier(
        architecture=config.model_architecture,
        num_classes=config.num_classes,
        pretrained=False
    ).to(device)
    
    model.load_state_dict(torch.load(checkpoint_path, map_location=device))
    model.eval()
    
    all_preds = []
    all_targets = []
    all_probs = []
    
    print("Evaluating model...")
    with torch.no_grad():
        for inputs, labels in tqdm(test_loader):
            inputs = inputs.to(device)
            
            with autocast():
                outputs = model(inputs)
                probs = torch.nn.functional.softmax(outputs, dim=1)
                
            _, predicted = outputs.max(1)
            
            all_preds.extend(predicted.cpu().numpy())
            all_targets.extend(labels.numpy())
            all_probs.extend(probs.cpu().numpy())
            
    # Classification Report
    print("\nClassification Report:")
    report = classification_report(all_targets, all_preds, target_names=class_names, digits=4)
    print(report)
    
    # Save Report
    os.makedirs("reports/", exist_ok=True)
    with open(f"reports/{config.crop}_classification_report.txt", "w") as f:
        f.write(report)
        
    # Confusion Matrix
    cm = confusion_matrix(all_targets, all_preds)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
    plt.title(f'Confusion Matrix - {config.crop.capitalize()}')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(f"reports/{config.crop}_confusion_matrix.png")
    print(f"Saved confusion matrix to reports/{config.crop}_confusion_matrix.png")
    
    # Error Analysis: Find top failed predictions
    # A failure is where pred != target. Let's find those with high confidence.
    errors = []
    for i in range(len(all_targets)):
        if all_targets[i] != all_preds[i]:
            confidence = all_probs[i][all_preds[i]]
            errors.append({
                'index': i,
                'true_class': idx_to_class[all_targets[i]],
                'pred_class': idx_to_class[all_preds[i]],
                'confidence': confidence
            })
            
    # Sort by confidence descending
    errors.sort(key=lambda x: x['confidence'], reverse=True)
    print(f"\nTop 5 High-Confidence Failures for {config.crop}:")
    for e in errors[:5]:
        print(f"True: {e['true_class']:<15} Pred: {e['pred_class']:<15} Conf: {e['confidence']:.4f}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, required=True, help="Path to crop yaml config")
    parser.add_argument("--checkpoint", type=str, required=True, help="Path to best_model.pth")
    args = parser.parse_args()
    
    evaluate(args.config, args.checkpoint)
