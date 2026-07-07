import os
import cv2
import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
import albumentations as A

class DiseaseDataset(Dataset):
    def __init__(self, metadata_path, crop_name, split='train', transform=None):
        """
        Args:
            metadata_path (string): Path to the metadata.csv file.
            crop_name (string): Name of the crop to filter by (e.g., 'wheat').
            split (string): 'train', 'val', or 'test'.
            transform (callable, optional): Optional Albumentations transform to be applied.
        """
        self.metadata = pd.read_csv(metadata_path)
        
        # Filter by crop and split
        self.metadata = self.metadata[
            (self.metadata['crop'].str.lower() == crop_name.lower()) &
            (self.metadata['split'].str.lower() == split.lower())
        ].reset_index(drop=True)
        
        self.transform = transform
        
        # Create a mapping from disease name to class index
        unique_classes = sorted(self.metadata['disease'].unique())
        self.class_to_idx = {cls_name: idx for idx, cls_name in enumerate(unique_classes)}
        self.idx_to_class = {idx: cls_name for cls_name, idx in self.class_to_idx.items()}

    def __len__(self):
        return len(self.metadata)

    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()

        img_path = self.metadata.iloc[idx]['image_path']
        img_path = img_path.replace('../data/', 'data/')
        
        if not os.path.exists(img_path):
            # In a real scenario, handle missing file gracefully or throw explicit error
            raise FileNotFoundError(f"Image not found at {img_path}")
            
        image = cv2.imread(img_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        label_str = self.metadata.iloc[idx]['disease']
        label = self.class_to_idx[label_str]

        if self.transform:
            augmented = self.transform(image=image)
            image = augmented['image']

        # Albumentations ToTensorV2 converts to torch tensor and moves channels to first dim
        return image, label

def get_dataloaders(config, train_transform, val_transform, test_transform=None):
    """
    Helper function to create dataloaders
    """
    train_dataset = DiseaseDataset(
        metadata_path=config.metadata_path,
        crop_name=config.crop,
        split='train',
        transform=train_transform
    )
    
    val_dataset = DiseaseDataset(
        metadata_path=config.metadata_path,
        crop_name=config.crop,
        split='val',
        transform=val_transform
    )
    
    train_loader = DataLoader(
        train_dataset, 
        batch_size=config.batch_size, 
        shuffle=True, 
        num_workers=0,
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset, 
        batch_size=config.batch_size, 
        shuffle=False, 
        num_workers=0,
        pin_memory=True
    )
    
    test_loader = None
    if test_transform:
        test_dataset = DiseaseDataset(
            metadata_path=config.metadata_path,
            crop_name=config.crop,
            split='test',
            transform=test_transform
        )
        test_loader = DataLoader(
            test_dataset, 
            batch_size=config.batch_size, 
            shuffle=False, 
            num_workers=0,
            pin_memory=True
        )
        
    return train_loader, val_loader, test_loader, train_dataset.class_to_idx
