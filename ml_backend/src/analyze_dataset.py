import os
import json
import cv2
from tqdm import tqdm

def analyze_raw_dataset(raw_dir):
    summary = {
        "total_images": 0,
        "classes": {},
        "formats": {},
        "resolutions": {}
    }
    
    if not os.path.exists(raw_dir):
        print(f"Error: {raw_dir} does not exist.")
        return
        
    for root, dirs, files in os.walk(raw_dir):
        if not files: continue
        
        class_name = os.path.basename(root)
        if class_name not in summary["classes"]:
            summary["classes"][class_name] = 0
            
        for file in tqdm(files, desc=f"Analyzing {class_name}", leave=False):
            ext = os.path.splitext(file)[1].lower()
            if ext not in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
                continue
                
            summary["total_images"] += 1
            summary["classes"][class_name] += 1
            
            # Format tracking
            summary["formats"][ext] = summary["formats"].get(ext, 0) + 1
            
            # Sub-sample resolution reading for speed (10% of images)
            if summary["classes"][class_name] % 10 == 0:
                img_path = os.path.join(root, file)
                img = cv2.imread(img_path)
                if img is not None:
                    res = f"{img.shape[1]}x{img.shape[0]}"
                    summary["resolutions"][res] = summary["resolutions"].get(res, 0) + 1

    # Write JSON
    os.makedirs("../data/processed/", exist_ok=True)
    with open("../data/processed/dataset_summary.json", "w") as f:
        json.dump(summary, f, indent=4)
        
    # Write MD
    with open("../data/processed/dataset_summary.md", "w") as f:
        f.write("# Kaggle 20K Dataset Summary\n\n")
        f.write(f"**Total Images:** {summary['total_images']}\n\n")
        f.write("## Class Distribution\n")
        for cls, count in sorted(summary['classes'].items()):
            f.write(f"* **{cls}**: {count}\n")
        
        f.write("\n## File Formats\n")
        for ext, count in summary['formats'].items():
            f.write(f"* {ext}: {count}\n")
            
    print("Analysis complete. Check data/processed/dataset_summary.json")

if __name__ == "__main__":
    analyze_raw_dataset("../data/raw/20k_dataset")
