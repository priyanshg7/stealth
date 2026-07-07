import json
from src.config import ModelConfig
from src.dataset import get_dataloaders
from src.augmentations import get_validation_augmentation

for crop in ["cotton", "maize", "wheat"]:
    config = ModelConfig.from_yaml(f"configs/{crop}.yaml")
    val_transform = get_validation_augmentation(config.image_size)
    _, _, test_loader, class_to_idx = get_dataloaders(config, None, val_transform, val_transform)
    print(f"--- {crop} ---")
    print("DataLoader class_to_idx:")
    print(class_to_idx)
    with open(f"models/metadata/{crop}_class_mapping.json") as f:
        mapping = json.load(f)
    print("models/metadata mapping:")
    print(mapping)
