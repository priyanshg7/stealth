import os

def setup_wheat_rust():
    print("="*50)
    print("CGIAR Wheat Rust Dataset Download Instructions")
    print("="*50)
    print("Dataset Name: CGIAR Computer Vision for Crop Disease (Wheat Rust)")
    print("Source URL: https://zindi.africa/competitions/iclr-workshop-challenge-1-cgiar-computer-vision-for-crop-disease")
    print("\nRequired User Action:")
    print("1. Create an account on Zindi.africa.")
    print("2. Join the competition linked above.")
    print("3. Download the train.zip and test.zip files manually.")
    print("4. Extract the contents into data/raw/wheat_rust/")
    print("\nExpected Folder Structure:")
    print("data/raw/wheat_rust/")
    print("  ├── train/")
    print("  ├── test/")
    print("  └── Train.csv")
    
    os.makedirs("../data/raw/wheat_rust", exist_ok=True)
    print("\nStatus: Created target directory at ../data/raw/wheat_rust")

if __name__ == "__main__":
    setup_wheat_rust()
