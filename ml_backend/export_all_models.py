import os
import glob
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
import torch
import json
import datetime
from pathlib import Path
from src.config import ModelConfig
from src.models import DiseaseClassifier
from src.dataset import get_dataloaders
from src.augmentations import get_validation_augmentation

# Directories
ONNX_DIR = "models/onnx"
METADATA_DIR = "models/metadata"
CHECKPOINT_DIR = "models/checkpoints"

os.makedirs(ONNX_DIR, exist_ok=True)
os.makedirs(METADATA_DIR, exist_ok=True)

registry = []

def export_model():
    configs = glob.glob("configs/*.yaml")
    configs = [c for c in configs if 'label_mapping.yaml' not in c]

    for config_path in configs:
        config = ModelConfig.from_yaml(config_path)
        crop = config.crop.lower()
        ckpt_path = os.path.join(CHECKPOINT_DIR, crop, "best_model.pth")
        
        if not os.path.exists(ckpt_path):
            print(f"Skipping {crop}, checkpoint not found.")
            continue
            
        print(f"Exporting {crop} model to ONNX...")
        
        # Load Model
        device = torch.device('cpu') # Export on CPU
        model = DiseaseClassifier(
            architecture=config.model_architecture,
            num_classes=config.num_classes,
            pretrained=False
        )
        model.load_state_dict(torch.load(ckpt_path, map_location=device))
        model.eval()

        # Dummy Input
        dummy_input = torch.randn(1, 3, config.image_size, config.image_size)

        import shutil
        # ONNX Export Path
        temp_onnx_path = f"{crop}_classifier.onnx"
        final_onnx_path = f"models/onnx/{crop}_classifier.onnx"

        # Export
        torch.onnx.export(
            model,
            dummy_input,
            temp_onnx_path,
            export_params=True,
            do_constant_folding=True,
            input_names=['input'],
            output_names=['output']
        )
        
        # Move files to ONNX_DIR
        import gc
        import time
        gc.collect()
        time.sleep(0.5)
        
        if os.path.exists(temp_onnx_path):
            if os.path.exists(final_onnx_path):
                try: os.remove(final_onnx_path)
                except: pass
            try:
                shutil.move(temp_onnx_path, final_onnx_path)
            except Exception as e:
                print(f"Failed to move {temp_onnx_path}: {e}")
        if os.path.exists(temp_onnx_path + ".data"):
            if os.path.exists(final_onnx_path + ".data"):
                try: os.remove(final_onnx_path + ".data")
                except: pass
            try:
                shutil.move(temp_onnx_path + ".data", final_onnx_path + ".data")
            except Exception as e:
                print(f"Failed to move data file: {e}")
        
        print(f"Exported to {final_onnx_path}")
        onnx_path = final_onnx_path
        
        # We need accuracy and F1 for the registry. 
        # I will parse them from classification reports generated earlier.
        acc, f1 = 0.0, 0.0
        report_file = f"reports/{crop}_classification_report.txt"
        if os.path.exists(report_file):
            with open(report_file, 'r') as f:
                lines = f.readlines()
                for line in lines:
                    if 'accuracy' in line:
                        parts = line.split()
                        acc = float(parts[1]) if len(parts) > 1 else 0.0
                    elif 'macro avg' in line:
                        parts = line.split()
                        f1 = float(parts[-2]) if len(parts) > 2 else 0.0

        # Load saved class mappings instead of regenerating
        mapping_path = os.path.join(METADATA_DIR, f"{crop}_class_mapping.json")
        try:
            with open(mapping_path, 'r') as f:
                class_idx = json.load(f)
            idx_to_class = {v: k for k, v in class_idx.items()}
            classes = [idx_to_class[i] for i in range(len(idx_to_class))]
        except Exception as e:
            print(f"Warning: Could not load class mapping for {crop}: {e}")
            classes = []

        registry_entry = {
            "crop": crop,
            "version": "1.0.0",
            "architecture": config.model_architecture,
            "image_size": config.image_size,
            "accuracy": acc,
            "f1_score": f1,
            "classes": classes,
            "export_date": datetime.datetime.now().isoformat(),
            "model_path": onnx_path
        }
        registry.append(registry_entry)

    # Save Registry
    registry_path = os.path.join(METADATA_DIR, "registry.json")
    with open(registry_path, "w") as f:
        json.dump(registry, f, indent=4)
        
    print(f"\nModel Registry saved to {registry_path}")

if __name__ == "__main__":
    export_model()
