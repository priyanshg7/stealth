import os
import glob
import torch
import onnxruntime as ort
import numpy as np
from src.config import ModelConfig
from src.models import DiseaseClassifier

def validate_models():
    configs = glob.glob("configs/*.yaml")
    configs = [c for c in configs if 'label_mapping.yaml' not in c]
    
    report_lines = ["# ONNX Validation Report", ""]
    
    for config_path in configs:
        config = ModelConfig.from_yaml(config_path)
        crop = config.crop.lower()
        
        pth_path = f"models/checkpoints/{crop}/best_model.pth"
        onnx_path = f"models/onnx/{crop}_classifier.onnx"
        
        if not os.path.exists(pth_path) or not os.path.exists(onnx_path):
            continue
            
        print(f"Validating {crop.upper()} model...")
        
        # 1. Load PyTorch model
        model = DiseaseClassifier(
            architecture=config.model_architecture,
            num_classes=config.num_classes,
            pretrained=False
        )
        model.load_state_dict(torch.load(pth_path, map_location='cpu'))
        model.eval()
        
        # 2. Load ONNX model
        ort_session = ort.InferenceSession(onnx_path, providers=['CPUExecutionProvider'])
        
        # 3. Create dummy input
        dummy_input = torch.randn(1, 3, config.image_size, config.image_size)
        
        # 4. PyTorch Inference
        with torch.no_grad():
            pt_out = model(dummy_input)
            pt_probs = torch.nn.functional.softmax(pt_out, dim=1).numpy()
            
        # 5. ONNX Inference
        ort_inputs = {ort_session.get_inputs()[0].name: dummy_input.numpy()}
        ort_outs = ort_session.run(None, ort_inputs)
        
        # Since the model returns raw logits, apply softmax identically
        def softmax(x):
            e_x = np.exp(x - np.max(x))
            return e_x / e_x.sum(axis=1, keepdims=True)
            
        onnx_probs = softmax(ort_outs[0])
        
        # 6. Compare
        max_diff = np.max(np.abs(pt_probs - onnx_probs))
        status = "PASSED" if max_diff < 1e-4 else "FAILED"
        
        report_lines.append(f"### {crop.capitalize()} Validation: {status}")
        report_lines.append(f"- Max Probability Deviation: `{max_diff:.8e}`")
        report_lines.append(f"- PyTorch Top Class: `{np.argmax(pt_probs)}`")
        report_lines.append(f"- ONNX Top Class: `{np.argmax(onnx_probs)}`")
        report_lines.append("")
        
    with open("onnx_validation_report.md", "w") as f:
        f.write("\n".join(report_lines))
        
    print("Validation complete. Report saved to onnx_validation_report.md")

if __name__ == "__main__":
    validate_models()
