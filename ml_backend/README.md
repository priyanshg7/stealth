# KisanMitra Disease Diagnosis ML Pipeline

This repository contains the complete Machine Learning training pipeline for KisanMitra's crop-specific disease classifiers.

## Setup

1. Create a virtual environment and install dependencies:
```bash
pip install -r requirements.txt
```

2. Authenticate with Weights & Biases for experiment tracking:
```bash
wandb login
```

## Dataset Acquisition

The datasets required for this project must be downloaded and placed into the `data/raw/` directory.

### 1. PlantVillage Dataset
* **Source:** https://github.com/spMohanty/PlantVillage-Dataset
* **User Action Required:** Use the provided script `scripts/download_plantvillage.py` or manually download and extract to `data/raw/PlantVillage/`.

### 2. PlantDoc Dataset
* **Source:** https://github.com/pratikkayal/PlantDoc-Dataset
* **User Action Required:** Use `scripts/download_plantdoc.py` or manually download and extract to `data/raw/PlantDoc/`.

### 3. CGIAR Wheat Rust Dataset
* **Source:** https://zindi.africa/competitions/iclr-workshop-challenge-1-cgiar-computer-vision-for-crop-disease
* **User Action Required:** You must create an account on Zindi to download this dataset. Download it manually and extract it to `data/raw/wheat_rust/`.

## Running the Pipeline

You can run the pipeline using the provided Jupyter Notebooks in the `notebooks/` folder for an interactive experience, or run the scripts directly:

1. **Train Model:**
```bash
python src/train.py --config configs/tomato.yaml
```

2. **Evaluate Model:**
```bash
python src/evaluate.py --config configs/tomato.yaml --checkpoint models/checkpoints/tomato/best_model.pth
```

3. **Export to ONNX:**
```bash
python src/export_onnx.py --config configs/tomato.yaml --checkpoint models/checkpoints/tomato/best_model.pth --output models/tomato_classifier.onnx
```
