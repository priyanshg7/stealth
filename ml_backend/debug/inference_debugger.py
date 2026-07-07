import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import torch
import numpy as np
from PIL import Image
import json
import glob

from src.config import ModelConfig
from src.models import DiseaseClassifier
from api.services.inference_engine import InferenceEngine

def debug_inference():
    configs = glob.glob("configs/*.yaml")
    configs = [c for c in configs if 'label_mapping.yaml' not in c]
    
    engine = InferenceEngine()
    
    report = []
    
    for config_path in configs:
        config = ModelConfig.from_yaml(config_path)
        crop = config.crop.lower()
        
        # Load PyTorch Model
        device = torch.device('cpu')
        model = DiseaseClassifier(architecture=config.model_architecture, num_classes=config.num_classes, pretrained=False)
        ckpt_path = os.path.join("models/checkpoints", crop, "best_model.pth")
        if not os.path.exists(ckpt_path):
            continue
            
        model.load_state_dict(torch.load(ckpt_path, map_location=device))
        model.eval()
        
        # Get test dataloader
        from src.dataset import get_dataloaders
        from src.augmentations import get_validation_augmentation
        
        val_transform = get_validation_augmentation(config.image_size)
        _, _, test_loader, _ = get_dataloaders(config, None, val_transform, test_transform=val_transform)
        
        if test_loader is None or len(test_loader.dataset) == 0:
            continue
            
        test_dataset = test_loader.dataset
        img_path = test_dataset.metadata.iloc[0]['image_path']
        img_path = img_path.replace('../data/', 'data/')
        pil_image = Image.open(img_path).convert("RGB")

        
        # Inference Engine Pipeline
        engine_result = engine.predict(crop, pil_image)
        engine_pred = engine_result["disease"]
        engine_conf = engine_result["confidence"]
        
        # PyTorch Pipeline
        img_tensor = engine.preprocess_image(pil_image, config.image_size)
        img_tensor_pt = torch.tensor(img_tensor, dtype=torch.float32)
        
        with torch.no_grad():
            logits = model(img_tensor_pt)
            probs = torch.softmax(logits, dim=1).numpy()[0]
            
        pt_idx = np.argmax(probs)
        pt_conf = probs[pt_idx]
        
        # Use class mapping from metadata
        with open(f"models/metadata/{crop}_class_mapping.json", 'r') as f:
            mapping = json.load(f)
            idx_to_class = {v: k for k, v in mapping.items()}
            
        pt_pred = idx_to_class[pt_idx]
        
        report.append(f"### {crop.upper()}")
        report.append(f"- PyTorch Pred: {pt_pred} (Conf: {pt_conf:.4f})")
        report.append(f"- Engine Pred: {engine_pred} (Conf: {engine_conf:.4f})")
        report.append(f"- Match: {'YES' if pt_pred == engine_pred else 'NO'}\n")
        
    with open("debug/inference_debugger_report.md", "w") as f:
        f.write("\n".join(report))
        
if __name__ == "__main__":
    debug_inference()
