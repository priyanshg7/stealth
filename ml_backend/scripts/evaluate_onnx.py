import os
import glob
import logging
from api.services.inference_engine import InferenceEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def evaluate_models():
    logger.info("Starting ONNX Model Evaluation...")
    
    dataset_dir = os.path.join(os.path.dirname(__file__), "..", "dataset")
    if not os.path.exists(dataset_dir):
        logger.error(f"Dataset directory not found at {dataset_dir}. Cannot run evaluation on test images.")
        logger.info("Evaluation report generation cannot be performed automatically. Please refer to training artifacts in 'reports/'.")
        return
        
    engine = InferenceEngine()
    
    # Placeholder for actual evaluation logic when dataset is available
    # Iterate through dataset directory
    # Run engine.predict()
    # Compute accuracy, confusion matrix, top-5, etc.
    
if __name__ == "__main__":
    evaluate_models()
