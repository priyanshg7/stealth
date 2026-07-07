import yaml
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class ModelConfig:
    crop: str
    batch_size: int
    learning_rate: float
    epochs: int
    image_size: int
    num_classes: int
    model_architecture: str
    pretrained: bool = True
    metadata_path: str = "../data/processed/metadata.csv"
    checkpoint_dir: str = "../models/checkpoints/default/"
    
    @classmethod
    def from_yaml(cls, yaml_path: str):
        if not os.path.exists(yaml_path):
            raise FileNotFoundError(f"Configuration file not found: {yaml_path}")
            
        with open(yaml_path, "r") as f:
            config_dict = yaml.safe_load(f)
            
        return cls(**config_dict)
