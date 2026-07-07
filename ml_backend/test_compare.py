import torch
import numpy as np
import onnxruntime as ort
import sys
import os
import cv2
from PIL import Image

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from src.models import DiseaseClassifier
from src.config import ModelConfig
import albumentations as A
from albumentations.pytorch import ToTensorV2

crop = "maize"
config = ModelConfig.from_yaml(f"configs/{crop}.yaml")

# Load PyTorch
device = torch.device('cpu')
pt_model = DiseaseClassifier(architecture=config.model_architecture, num_classes=config.num_classes, pretrained=False)
pt_model.load_state_dict(torch.load(f"models/checkpoints/{crop}/best_model.pth", map_location=device))
pt_model.eval()

# Load ONNX
onnx_path = f"models/onnx/{crop}_classifier.onnx"
session = ort.InferenceSession(onnx_path, providers=['CPUExecutionProvider'])

# Data
from src.dataset import get_dataloaders
from src.augmentations import get_validation_augmentation
val_transform = get_validation_augmentation(config.image_size)
_, _, test_loader, class_to_idx = get_dataloaders(config, None, val_transform, val_transform)

for i, (imgs, labels) in enumerate(test_loader):
    if i == 0:
        break

img_tensor = imgs[0:1] # Batch of 1
label = labels[0].item()

# PyTorch Inference
with torch.no_grad():
    pt_out = pt_model(img_tensor).numpy()

# ONNX Inference
input_name = session.get_inputs()[0].name
onnx_out = session.run(None, {input_name: img_tensor.numpy()})[0]

print(f"Label: {label}")
print("PyTorch Out:")
print(pt_out)
print("ONNX Out:")
print(onnx_out)
