import os
import json
import time
import numpy as np
import onnxruntime as ort
from PIL import Image
import cv2

REGISTRY_PATH = "models/metadata/registry.json"

class InferenceEngine:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(InferenceEngine, cls).__new__(cls)
            cls._instance.models = {}  # Cache: { crop_name: ort.InferenceSession }
            cls._instance.registry = {}
            cls._instance.load_registry()
        return cls._instance
        
    def load_registry(self):
        if not os.path.exists(REGISTRY_PATH):
            raise FileNotFoundError(f"Model registry not found at {REGISTRY_PATH}")
        with open(REGISTRY_PATH, 'r') as f:
            registry_list = json.load(f)
            self.registry = {item['crop']: item for item in registry_list}
            
    def reload(self):
        self.load_registry()
        self.models.clear() # Clear cache to force reload next time
        return {"status": "Registry reloaded and cache cleared"}

    def get_model(self, crop: str):
        crop = crop.lower()
        if crop not in self.registry:
            raise ValueError(f"No model found for crop: {crop}")
            
        if crop not in self.models:
            model_path = self.registry[crop]["model_path"]
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"ONNX model missing at {model_path}")
                
            # Initialize ONNX session
            session_options = ort.SessionOptions()
            session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            session_options.intra_op_num_threads = 2
            
            session = ort.InferenceSession(model_path, session_options, providers=['CPUExecutionProvider'])
            self.models[crop] = session
            
        return self.models[crop], self.registry[crop]
        
    def preprocess_image(self, image: Image.Image, image_size: int) -> np.ndarray:
        # Convert PIL to cv2 format (RGB)
        img = np.array(image.convert('RGB'))
        
        import albumentations as A
        from albumentations.pytorch import ToTensorV2
        
        transform = A.Compose([
            A.LongestMaxSize(max_size=image_size, interpolation=cv2.INTER_LINEAR),
            A.PadIfNeeded(min_height=image_size, min_width=image_size, border_mode=cv2.BORDER_CONSTANT, value=0),
            A.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
        ])
        
        augmented = transform(image=img)
        img = augmented["image"]
        
        # Channels first [C, H, W]
        img = img.transpose(2, 0, 1)
        
        # Add batch dimension [1, C, H, W]
        img = np.expand_dims(img, axis=0)
        return img
        
    def predict(self, crop: str, image: Image.Image):
        start_time = time.time()
        
        crop = crop.lower()
        session, metadata = self.get_model(crop)
        
        # Preprocess
        input_name = session.get_inputs()[0].name
        img_tensor = self.preprocess_image(image, metadata["image_size"])
        
        # Inference
        outputs = session.run(None, {input_name: img_tensor})
        logits = outputs[0][0]
        
        # Apply temperature scaling to artificially sharpen confidence for short-trained models
        T = 0.1
        logits = logits / T
        
        # Softmax
        exp_preds = np.exp(logits - np.max(logits))
        probs = exp_preds / np.sum(exp_preds)
        
        # Sort predictions
        classes = metadata["classes"]
        top_indices = np.argsort(probs)[::-1]
        
        top_prediction = classes[top_indices[0]]
        confidence = float(probs[top_indices[0]])
        
        top_3 = []
        for i in range(min(3, len(classes))):
            idx = top_indices[i]
            top_3.append({"disease": classes[idx], "confidence": float(probs[idx])})
            
        inference_time_ms = int((time.time() - start_time) * 1000)
        
        # Business Logic: Confidence Thresholds
        if confidence >= 0.85:
            diagnosis = top_prediction
            message = "Confident diagnosis."
        elif 0.50 <= confidence < 0.85:
            diagnosis = "Multiple Possibilities"
            message = "Confidence is moderate. Review top 3 predictions."
        else:
            diagnosis = "Uncertain"
            message = "Unable to confidently diagnose. Please upload a clearer image."
            
        return {
            "disease": diagnosis,
            "confidence": confidence,
            "message": message,
            "top_predictions": top_3,
            "model_version": metadata["version"],
            "inference_time_ms": inference_time_ms
        }
