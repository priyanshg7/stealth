import os

def setup_plantvillage():
    print("="*50)
    print("PlantVillage Dataset Download Instructions")
    print("="*50)
    print("Dataset Name: PlantVillage")
    print("Source URL: https://github.com/spMohanty/PlantVillage-Dataset")
    print("\nRequired User Action:")
    print("1. Install git if not installed.")
    print("2. Run the following command in your terminal:")
    print("   git clone https://github.com/spMohanty/PlantVillage-Dataset.git data/raw/PlantVillage")
    print("\nExpected Folder Structure:")
    print("data/raw/PlantVillage/raw/color/")
    print("  ├── Tomato___healthy/")
    print("  ├── Tomato___Early_blight/")
    print("  └── ...")
    
    os.makedirs("../data/raw/PlantVillage", exist_ok=True)
    print("\nStatus: Created target directory at ../data/raw/PlantVillage")

if __name__ == "__main__":
    setup_plantvillage()
