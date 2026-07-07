import sys
import os
import shutil

# Make sure we're in ml_pipeline/notebooks
notebooks_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'notebooks')
os.chdir(notebooks_dir)
sys.path.append('../src')
sys.path.append('../scripts')

from filter_classes import filter_dataset
from image_validator import validate_images
from deduplicate import deduplicate_dataset
from image_standardizer import standardize_images
from metadata_generator import generate_metadata
from train_split import generate_splits
from dataset_report import generate_report

print("Staging all datasets...")
if os.path.exists('../data/raw/staged_dataset'):
    shutil.rmtree('../data/raw/staged_dataset')
os.makedirs('../data/raw/staged_dataset', exist_ok=True)

filter_dataset('../data/raw/20k_dataset', '../data/raw/staged_dataset')
filter_dataset('../data/raw/PlantVillage', '../data/raw/staged_dataset')
filter_dataset('../data/raw/PlantDoc', '../data/raw/staged_dataset')
filter_dataset('../data/raw/wheat_rust', '../data/raw/staged_dataset')

print("Validating images...")
validate_images('../data/raw/staged_dataset', '../data/raw/validated_dataset', '../data/rejected/')

print("Deduplicating...")
deduplicate_dataset('../data/raw/validated_dataset')

print("Standardizing images (resizing to 224x224)...")
image_records = standardize_images('../data/raw/validated_dataset', '../data/processed/images/')

print("Generating metadata...")
metadata_df = generate_metadata(image_records)

print("Splitting train/val/test...")
final_df = generate_splits(metadata_df)

print("Generating final report...")
generate_report(final_df)

print("ALL DONE! Pipeline is ready for training.")
