import os
import json
import glob
import datetime
from src.config import ModelConfig

def update_registry():
    registry = []
    configs = glob.glob("configs/*.yaml")
    configs = [c for c in configs if 'label_mapping.yaml' not in c]
    
    for config_path in configs:
        config = ModelConfig.from_yaml(config_path)
        crop = config.crop.lower()
        
        # Load classes from extracted class mapping
        mapping_path = f"models/metadata/{crop}_class_mapping.json"
        if not os.path.exists(mapping_path):
            continue
            
        with open(mapping_path, 'r') as f:
            class_idx = json.load(f)
            idx_to_class = {v: k for k, v in class_idx.items()}
            classes = [idx_to_class[i] for i in range(len(idx_to_class))]
            
        # Parse accuracy and F1 from reports
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
                        
        onnx_path = f"models/onnx/{crop}_classifier.onnx"
        
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
        
    registry_path = "models/metadata/registry.json"
    with open(registry_path, "w") as f:
        json.dump(registry, f, indent=4)
        
    print(f"Updated registry.json with {len(registry)} crops.")

if __name__ == "__main__":
    update_registry()
