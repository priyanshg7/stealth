import os
import glob
import json
from src.config import ModelConfig
from src.dataset import get_dataloaders

def extract_mappings():
    configs = glob.glob("configs/*.yaml")
    configs = [c for c in configs if 'label_mapping.yaml' not in c]
    
    os.makedirs("models/metadata", exist_ok=True)
    
    for config_path in configs:
        config = ModelConfig.from_yaml(config_path)
        crop = config.crop.lower()
        
        try:
            # get_dataloaders automatically computes class_to_idx from the 'train' split inside
            _, _, _, class_to_idx = get_dataloaders(config, train_transform=None, val_transform=None)
            
            mapping_path = f"models/metadata/{crop}_class_mapping.json"
            with open(mapping_path, 'w') as f:
                json.dump(class_to_idx, f, indent=4)
                
            print(f"Extracted training class mapping for {crop}: {len(class_to_idx)} classes -> {mapping_path}")
        except Exception as e:
            print(f"Failed to extract for {crop}: {e}")

if __name__ == "__main__":
    extract_mappings()
