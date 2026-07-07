import os
import pandas as pd
from label_mapper import LabelMapper
import shutil

def filter_dataset(raw_dir, staged_dir):
    mapper = LabelMapper()
    os.makedirs(staged_dir, exist_ok=True)
    
    removed_classes = []
    
    for root, dirs, files in os.walk(raw_dir):
        if not dirs and files:
            raw_class_name = os.path.basename(root)
            crop, disease = mapper.get_standardized_label(raw_class_name)
            
            if crop is None:
                removed_classes.append({
                    "raw_class": raw_class_name,
                    "reason": "Unsupported Crop"
                })
                continue
                
            supported_crops = ['wheat', 'rice', 'tomato', 'potato', 'cotton', 'maize', 'corn']
            if crop not in supported_crops:
                removed_classes.append({
                    "raw_class": raw_class_name,
                    "reason": f"Crop '{crop}' not in supported list"
                })
                continue
                
            # It's supported. Copy to staged dir
            target_class_dir = os.path.join(staged_dir, f"{crop}___{disease}")
            os.makedirs(target_class_dir, exist_ok=True)
            
            for file in files:
                src = os.path.join(root, file)
                dst = os.path.join(target_class_dir, file)
                shutil.copy2(src, dst)
                
    df = pd.DataFrame(removed_classes)
    df.to_csv("../data/processed/removed_classes.csv", index=False)
    print(f"Filtering complete. Kept supported crops in {staged_dir}. Removed classes logged in removed_classes.csv")

if __name__ == "__main__":
    filter_dataset("../data/raw/20k_dataset", "../data/raw/staged_dataset")
