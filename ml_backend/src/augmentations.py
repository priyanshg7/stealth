import albumentations as A
from albumentations.pytorch import ToTensorV2
import cv2

def get_training_augmentation(image_size=224):
    """
    Returns the Albumentations transform pipeline for training.
    """
    return A.Compose([
        A.LongestMaxSize(max_size=image_size, interpolation=cv2.INTER_LINEAR),
        A.PadIfNeeded(min_height=image_size, min_width=image_size, border_mode=cv2.BORDER_CONSTANT, value=0),
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.5),
        A.ShiftScaleRotate(shift_limit=0.05, scale_limit=0.1, rotate_limit=45, p=0.5),
        A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.5),
        A.GaussianBlur(blur_limit=(3, 5), p=0.2),
        A.CoarseDropout(max_holes=8, max_height=16, max_width=16, p=0.2),
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        ToTensorV2()
    ])

def get_validation_augmentation(image_size=224):
    """
    Returns the Albumentations transform pipeline for validation and testing.
    """
    return A.Compose([
        A.LongestMaxSize(max_size=image_size, interpolation=cv2.INTER_LINEAR),
        A.PadIfNeeded(min_height=image_size, min_width=image_size, border_mode=cv2.BORDER_CONSTANT, value=0),
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        ToTensorV2()
    ])
