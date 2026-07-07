import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import torch
import numpy as np
from PIL import Image
import json
import glob
import random
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import cv2


from src.config import ModelConfig
from src.models import DiseaseClassifier
from api.services.inference_engine import InferenceEngine

FAILURES_DIR = "reports/failures"
os.makedirs(FAILURES_DIR, exist_ok=True)
os.makedirs("reports/confusion_matrices_e2e", exist_ok=True)

def run_e2e_test():
    configs = glob.glob("configs/*.yaml")
    configs = [c for c in configs if 'label_mapping.yaml' not in c]
    
    engine = InferenceEngine()
    
    report = ["# End-to-End Inference Engine Regression Report\n"]
    
    for config_path in configs:
        config = ModelConfig.from_yaml(config_path)
        crop = config.crop.lower()
        print(f"\nEvaluating E2E for {crop.upper()}...")
        
        # Load PyTorch Model for Grad-CAM
        device = torch.device('cpu')
        pt_model = DiseaseClassifier(architecture=config.model_architecture, num_classes=config.num_classes, pretrained=False)
        ckpt_path = os.path.join("models/checkpoints", crop, "best_model.pth")
        if not os.path.exists(ckpt_path):
            continue
            
        pt_model.load_state_dict(torch.load(ckpt_path, map_location=device))
        pt_model.eval()
        
        # Collect images using dataloader
        from src.dataset import get_dataloaders
        from src.augmentations import get_validation_augmentation
        
        val_transform = get_validation_augmentation(config.image_size)
        _, _, test_loader, _ = get_dataloaders(config, None, val_transform, test_transform=val_transform)
        
        if test_loader is None or len(test_loader.dataset) == 0:
            continue
            
        test_dataset = test_loader.dataset
        image_paths = []
        for idx in range(len(test_dataset)):
            img_path = test_dataset.metadata.iloc[idx]['image_path'].replace('../data/', 'data/')
            disease = test_dataset.metadata.iloc[idx]['disease']
            image_paths.append((img_path, disease))

        # Sample 100 max
        random.seed(42)
        if len(image_paths) > 100:
            sampled = random.sample(image_paths, 100)
        else:
            sampled = image_paths
            
        y_true = []
        y_pred = []
        
        for img_path, expected_disease in sampled:
            pil_image = Image.open(img_path).convert("RGB")
            
            # Predict via Engine
            try:
                res = engine.predict(crop, pil_image)
            except Exception as e:
                print(f"Error predicting {img_path}: {e}")
                continue
                
            pred_disease = res["disease"]
            
            # Handle engine specific outputs
            if pred_disease == "Multiple Possibilities" or pred_disease == "Uncertain":
                # Fallback to top-1 for strict evaluation
                if len(res["top_predictions"]) > 0:
                    pred_disease = res["top_predictions"][0]["disease"]
                else:
                    pred_disease = "unknown"
                    
            y_true.append(expected_disease)
            y_pred.append(pred_disease)

        # Metrics
        if not y_true:
            continue
            
        acc = accuracy_score(y_true, y_pred)
        prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='macro', zero_division=0)
        
        report.append(f"## {crop.upper()}")
        report.append(f"- **Accuracy**: {acc:.4f}")
        report.append(f"- **Precision**: {prec:.4f}")
        report.append(f"- **Recall**: {rec:.4f}")
        report.append(f"- **F1 Score**: {f1:.4f}\n")
        
        # Confusion Matrix
        classes = sorted(list(set(y_true + y_pred)))
        cm = confusion_matrix(y_true, y_pred, labels=classes)
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', xticklabels=classes, yticklabels=classes)
        plt.title(f"{crop.upper()} End-to-End Confusion Matrix")
        plt.ylabel("True")
        plt.xlabel("Predicted")
        plt.tight_layout()
        plt.savefig(f"reports/confusion_matrices_e2e/{crop}_e2e_cm.png")
        plt.close()
        
    with open("debug/e2e_diagnostic_report.md", "w") as f:
        f.write("\n".join(report))
        
if __name__ == "__main__":
    run_e2e_test()
