from sklearn.model_selection import StratifiedShuffleSplit
import pandas as pd

def generate_splits(df):
    """
    Performs a 70/15/15 stratified split.
    Since we want to stratify by BOTH crop and disease, we'll create a composite key.
    """
    df['stratify_key'] = df['crop'] + "_" + df['disease']
    
    # Check if any class has < 3 images, which breaks splits. If so, drop them or duplicate them.
    class_counts = df['stratify_key'].value_counts()
    valid_keys = class_counts[class_counts >= 3].index
    
    df = df[df['stratify_key'].isin(valid_keys)].copy()
    
    # 1st Split: 70% Train, 30% Temp (Val + Test)
    splitter = StratifiedShuffleSplit(n_splits=1, test_size=0.3, random_state=42)
    for train_idx, temp_idx in splitter.split(df, df['stratify_key']):
        train_df = df.iloc[train_idx].copy()
        temp_df = df.iloc[temp_idx].copy()
        
    # 2nd Split: Split Temp in half for 15% Val and 15% Test
    # Check valid keys again for the temp split
    temp_counts = temp_df['stratify_key'].value_counts()
    valid_temp = temp_counts[temp_counts >= 2].index
    temp_df = temp_df[temp_df['stratify_key'].isin(valid_temp)].copy()
    
    splitter2 = StratifiedShuffleSplit(n_splits=1, test_size=0.5, random_state=42)
    for val_idx, test_idx in splitter2.split(temp_df, temp_df['stratify_key']):
        val_df = temp_df.iloc[val_idx].copy()
        test_df = temp_df.iloc[test_idx].copy()
        
    train_df['split'] = 'train'
    val_df['split'] = 'val'
    test_df['split'] = 'test'
    
    # Re-combine
    final_df = pd.concat([train_df, val_df, test_df]).drop(columns=['stratify_key'])
    
    # Save isolated splits
    train_df.drop(columns=['stratify_key']).to_csv("../data/processed/train.csv", index=False)
    val_df.drop(columns=['stratify_key']).to_csv("../data/processed/validation.csv", index=False)
    test_df.drop(columns=['stratify_key']).to_csv("../data/processed/test.csv", index=False)
    
    # Save combined
    final_df.to_csv("../data/processed/metadata.csv", index=False)
    print("Train/Val/Test splits successfully generated and metadata.csv updated.")
    
    return final_df

if __name__ == "__main__":
    import os
    if os.path.exists("../data/processed/metadata.csv"):
        df = pd.read_csv("../data/processed/metadata.csv")
        generate_splits(df)
    else:
        print("metadata.csv not found.")
