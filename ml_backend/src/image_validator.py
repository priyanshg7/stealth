import os
import cv2
import pandas as pd
import shutil
from tqdm import tqdm

def validate_images(staged_dir, validated_dir, rejected_dir):
    os.makedirs(validated_dir, exist_ok=True)
    os.makedirs(rejected_dir, exist_ok=True)
    
    report = []
    
    for root, dirs, files in os.walk(staged_dir):
        if not files: continue
        
        class_name = os.path.basename(root)
        val_class_dir = os.path.join(validated_dir, class_name)
        rej_class_dir = os.path.join(rejected_dir, class_name)
        
        os.makedirs(val_class_dir, exist_ok=True)
        os.makedirs(rej_class_dir, exist_ok=True)
        
        for file in tqdm(files, desc=f"Validating {class_name}", leave=False):
            file_path = os.path.join(root, file)
            
            # Check 0 byte
            if os.path.getsize(file_path) == 0:
                report.append({"file": file, "reason": "Zero-byte file"})
                shutil.move(file_path, os.path.join(rej_class_dir, file))
                continue
                
            img = cv2.imread(file_path)
            
            # Check corruption
            if img is None:
                report.append({"file": file, "reason": "Corrupted or Invalid Image"})
                shutil.move(file_path, os.path.join(rej_class_dir, file))
                continue
                
            # Check grayscale or dimensions
            if len(img.shape) != 3 or img.shape[2] != 3:
                report.append({"file": file, "reason": "Not RGB (Grayscale/CMYK)"})
                shutil.move(file_path, os.path.join(rej_class_dir, file))
                continue
                
            h, w = img.shape[:2]
            if h < 50 or w < 50:
                report.append({"file": file, "reason": f"Very low resolution ({w}x{h})"})
                shutil.move(file_path, os.path.join(rej_class_dir, file))
                continue
                
            # Valid image
            shutil.copy2(file_path, os.path.join(val_class_dir, file))
            
    df = pd.DataFrame(report)
    df.to_csv("../data/processed/validation_report.csv", index=False)
    print(f"Validation complete. Valid images in {validated_dir}. Report in validation_report.csv")

if __name__ == "__main__":
    validate_images("../data/raw/staged_dataset", "../data/raw/validated_dataset", "../data/rejected/")
