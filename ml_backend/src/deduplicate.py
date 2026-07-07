import os
import imagehash
from PIL import Image
import pandas as pd
from tqdm import tqdm

def deduplicate_dataset(validated_dir):
    hashes = {}
    duplicates = []
    
    # Process image by image
    all_files = []
    for root, _, files in os.walk(validated_dir):
        for f in files:
            all_files.append(os.path.join(root, f))
            
    for file_path in tqdm(all_files, desc="Deduplicating"):
        try:
            img = Image.open(file_path)
            h = imagehash.phash(img)
            
            is_dup = False
            for existing_hash, existing_path in hashes.items():
                # Hamming distance threshold of 5 for near duplicates
                if h - existing_hash <= 5:
                    duplicates.append({
                        "kept": existing_path,
                        "removed": file_path,
                        "distance": h - existing_hash
                    })
                    os.remove(file_path)
                    is_dup = True
                    break
                    
            if not is_dup:
                hashes[h] = file_path
                
        except Exception as e:
            print(f"Error hashing {file_path}: {e}")
            
    df = pd.DataFrame(duplicates)
    df.to_csv("../data/processed/duplicate_report.csv", index=False)
    print(f"Deduplication complete. Removed {len(duplicates)} duplicates. Report saved.")

if __name__ == "__main__":
    deduplicate_dataset("../data/raw/validated_dataset")
