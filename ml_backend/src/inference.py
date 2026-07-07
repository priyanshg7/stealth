import cv2
import numpy as np
import onnxruntime as ort
import json
import albumentations as A
from albumentations.pytorch import ToTensorV2

class DiseaseInferencer:
    def __init__(self, onnx_model_path, class_mapping_path, image_size=224):
        """
        Initializes the ONNX runtime session.
        class_mapping_path: A JSON file mapping class index to disease name.
        """
        self.session = ort.InferenceSession(onnx_model_path, providers=['CPUExecutionProvider'])
        
        with open(class_mapping_path, 'r') as f:
            self.idx_to_class = json.load(f)
            # Ensure keys are integers if they loaded as strings
            self.idx_to_class = {int(k): v for k, v in self.idx_to_class.items()}
            
        self.transform = A.Compose([
            A.LongestMaxSize(max_size=image_size, interpolation=cv2.INTER_LINEAR),
            A.PadIfNeeded(min_height=image_size, min_width=image_size, border_mode=cv2.BORDER_CONSTANT, value=0),
            A.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
            ToTensorV2()
        ])
        
    def softmax(self, x):
        e_x = np.exp(x - np.max(x))
        return e_x / e_x.sum(axis=1, keepdims=True)

    def predict(self, image_path):
        """
        Predicts the disease from an image path and applies confidence calibration.
        """
        image = cv2.imread(image_path)
        if image is None:
            return {"error": "Image not found or unreadable"}
            
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Preprocess
        augmented = self.transform(image=image)
        input_tensor = augmented['image'].numpy()
        input_batch = np.expand_dims(input_tensor, axis=0) # Add batch dim
        
        # Inference
        input_name = self.session.get_inputs()[0].name
        outputs = self.session.run(None, {input_name: input_batch})
        
        # Softmax probabilities
        probs = self.softmax(outputs[0])[0]
        
        # Get sorted predictions
        top_indices = np.argsort(probs)[::-1]
        
        top_conf = float(probs[top_indices[0]])
        top_class = self.idx_to_class[top_indices[0]]
        
        # Confidence Calibration Logic
        if top_conf >= 0.85:
            return {
                "status": "confident",
                "diagnosis": top_class,
                "confidence": top_conf
            }
        elif top_conf >= 0.50:
            top_3 = []
            for i in range(min(3, len(top_indices))):
                idx = top_indices[i]
                top_3.append({
                    "diagnosis": self.idx_to_class[idx],
                    "confidence": float(probs[idx])
                })
            return {
                "status": "moderately_confident",
                "message": "Showing top 3 likely diseases.",
                "predictions": top_3
            }
        else:
            return {
                "status": "uncertain",
                "message": "Unable to confidently diagnose this crop. Please provide a clearer picture.",
                "top_guess": top_class,
                "confidence": top_conf
            }

if __name__ == "__main__":
    # Example usage:
    # inferencer = DiseaseInferencer("../models/tomato_classifier.onnx", "../models/tomato_classes.json")
    # result = inferencer.predict("../data/raw/test_image.jpg")
    # print(result)
    pass
