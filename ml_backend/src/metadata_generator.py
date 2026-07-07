import pandas as pd
import os

def generate_metadata(image_records):
    df = pd.DataFrame(image_records)
    
    # Make path relative to project root for standard access
    df['image_path'] = df['new_path'].apply(lambda x: x.replace("\\", "/").split("ml_pipeline/")[-1] if "ml_pipeline/" in x.replace("\\", "/") else x.replace("\\", "/"))
    
    df['source_dataset'] = '20k_multiclass_crop_disease'
    df['validation_status'] = 'passed'
    df['dataset_version'] = 'v1.0'
    
    # Naive environment inference based on Kaggle source heuristics
    # PlantVillage portions are mostly lab.
    def infer_environment(row):
        if 'PlantVillage' in row['original_path'] or 'background' not in row['original_path'].lower():
            return 'unknown' # Can be refined later with a CNN
        return 'unknown'
        
    df['environment'] = df.apply(infer_environment, axis=1)
    
    # Drop intermediate columns
    df = df.drop(columns=['original_path', 'new_path'])
    
    return df

if __name__ == "__main__":
    print("This script is meant to be called by the notebook or a wrapper, after standardize_images returns records.")
