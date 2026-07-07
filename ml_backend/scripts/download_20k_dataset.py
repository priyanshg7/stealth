import os
import subprocess
import zipfile

def setup_20k_dataset():
    print("="*50)
    print("Kaggle 20K Multi-Class Crop Disease Dataset")
    print("="*50)
    
    dataset_name = "jawadali1045/20k-multi-class-crop-disease-images"
    raw_dir = "../data/raw/20k_dataset"
    zip_path = os.path.join(raw_dir, "20k-multi-class-crop-disease-images.zip")
    
    os.makedirs(raw_dir, exist_ok=True)
    
    # Check if Kaggle credentials exist
    kaggle_creds = os.path.expanduser("~/.kaggle/kaggle.json")
    if not os.path.exists(kaggle_creds):
        print("ERROR: Kaggle credentials not found at ~/.kaggle/kaggle.json")
        print("\nRequired User Action:")
        
        print("1. Go to https://www.kaggle.com/settings")
        print("2. Click 'Create New Token' to download kaggle.json")
        print("3. Place kaggle.json in ~/.kaggle/ (Windows: C:\\Users\\<Username>\\.kaggle\\)")
        print("4. Re-run this script.")
        return
        
    print("Kaggle credentials found. Proceeding with download...")
    
    if os.path.exists(os.path.join(raw_dir, "Plant_leave_diseases_dataset_without_augmentation")):
        print("Dataset already downloaded and extracted. Skipping.")
        return
        
    if not os.path.exists(zip_path):
        try:
            print("Downloading dataset via Kaggle API...")
            import sys
            subprocess.run([sys.executable, "-m", "kaggle", "datasets", "download", "-d", dataset_name, "-p", raw_dir], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Failed to download dataset. Ensure you have accepted any rules and Kaggle is installed. Error: {e}")
            return
    else:
        print("Zip file already exists. Skipping download.")

    print("Extracting ZIP file...")
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(raw_dir)
        print("Extraction complete.")
        
        # Cleanup
        print("Cleaning up ZIP file...")
        os.remove(zip_path)
    except zipfile.BadZipFile:
        print("Error: The zip file is corrupted. Deleting it. Please run this script again.")
        os.remove(zip_path)
        
    print(f"\nStatus: Dataset ready in {raw_dir}")

if __name__ == "__main__":
    setup_20k_dataset()
