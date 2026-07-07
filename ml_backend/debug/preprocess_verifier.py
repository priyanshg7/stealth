import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import torch
import numpy as np
from PIL import Image
import cv2

from src.augmentations import get_validation_augmentation
from api.services.inference_engine import InferenceEngine

def verify_preprocessing():
    print("=== Preprocessing Verification ===")
    
    # 1. Create a synthetic test image
    img_size = 224
    test_image_np = np.random.randint(0, 255, (img_size, img_size, 3), dtype=np.uint8)
    test_image_pil = Image.fromarray(test_image_np)
    
    # 2. PyTorch Pipeline (Training/Val)
    val_transform = get_validation_augmentation(img_size)
    augmented = val_transform(image=test_image_np)
    torch_tensor = augmented['image'] # Shape [3, H, W]
    torch_numpy = torch_tensor.numpy()
    
    # 3. Inference Engine Pipeline
    engine = InferenceEngine()
    
    # The inference engine adds a batch dimension [1, 3, H, W]
    engine_numpy = engine.preprocess_image(test_image_pil, img_size)[0]
    
    # 4. Compare
    print(f"PyTorch Output Shape: {torch_numpy.shape}")
    print(f"Inference Engine Output Shape: {engine_numpy.shape}")
    
    print(f"PyTorch Dtype: {torch_numpy.dtype}")
    print(f"Inference Engine Dtype: {engine_numpy.dtype}")
    
    # Calculate Max Difference
    diff = np.abs(torch_numpy - engine_numpy)
    max_diff = np.max(diff)
    mean_diff = np.mean(diff)
    
    print(f"Max Pixel Difference: {max_diff}")
    print(f"Mean Pixel Difference: {mean_diff}")
    
    if max_diff > 1e-4:
        print("❌ PREPROCESSING MISMATCH DETECTED!")
        print("Root cause likely here. The inference engine is applying slightly different resizing, color conversion, or normalization.")
    else:
        print("✅ Preprocessing pipelines match perfectly.")
        
if __name__ == "__main__":
    verify_preprocessing()
