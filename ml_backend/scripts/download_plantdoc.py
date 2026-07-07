import os

def setup_plantdoc():
    print("="*50)
    print("PlantDoc Dataset Download Instructions")
    print("="*50)
    print("Dataset Name: PlantDoc")
    print("Source URL: https://github.com/pratikkayal/PlantDoc-Dataset")
    print("\nRequired User Action:")
    print("1. Install git if not installed.")
    print("2. Run the following command in your terminal:")
    print("   git clone https://github.com/pratikkayal/PlantDoc-Dataset.git data/raw/PlantDoc")
    print("\nExpected Folder Structure:")
    print("data/raw/PlantDoc/train/")
    print("data/raw/PlantDoc/test/")
    print("  ├── Tomato leaf late blight/")
    print("  ├── Tomato early blight leaf/")
    print("  └── ...")
    
    os.makedirs("../data/raw/PlantDoc", exist_ok=True)
    print("\nStatus: Created target directory at ../data/raw/PlantDoc")

if __name__ == "__main__":
    setup_plantdoc()
