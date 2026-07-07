import os
import cv2
import uuid
from tqdm import tqdm

def standardize_images(validated_dir, final_image_dir, target_size=224):
    os.makedirs(final_image_dir, exist_ok=True)
    
    # We will rename files to UUIDs to prevent naming collisions
    image_records = []
    
    for root, dirs, files in os.walk(validated_dir):
        if not files: continue
        
        class_name = os.path.basename(root) # formatted as crop___disease
        crop, disease = class_name.split("___")
        
        for file in tqdm(files, desc=f"Standardizing {class_name}", leave=False):
            file_path = os.path.join(root, file)
            img = cv2.imread(file_path)
            
            if img is None: continue
            
            # Pad to square and resize
            h, w = img.shape[:2]
            max_side = max(h, w)
            
            # Create black background
            square = cv2.copyMakeBorder(
                img, 
                (max_side - h) // 2, 
                max_side - h - (max_side - h) // 2,
                (max_side - w) // 2, 
                max_side - w - (max_side - w) // 2,
                cv2.BORDER_CONSTANT, value=[0, 0, 0]
            )
            
            resized = cv2.resize(square, (target_size, target_size), interpolation=cv2.INTER_AREA)
            
            new_id = str(uuid.uuid4())
            new_filename = f"{new_id}.jpg"
            
            # Save into final crop directory
            crop_dir = os.path.join(final_image_dir, crop)
            os.makedirs(crop_dir, exist_ok=True)
            new_path = os.path.join(crop_dir, new_filename)
            
            # Save as JPEG (removes EXIF implicitly via cv2)
            cv2.imwrite(new_path, resized, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
            
            image_records.append({
                "image_id": new_id,
                "crop": crop,
                "disease": disease,
                "original_path": file_path,
                "new_path": new_path,
                "width": w,
                "height": h
            })
            
    return image_records

if __name__ == "__main__":
    standardize_images("../data/raw/validated_dataset", "../data/processed/images/")
