import argparse
import os
import torch
import torch.onnx
import onnx
import onnxruntime as ort
import numpy as np

from config import ModelConfig
from models import DiseaseClassifier

def export_to_onnx(config_path, checkpoint_path, output_path):
    config = ModelConfig.from_yaml(config_path)
    
    print(f"Loading model architecture: {config.model_architecture} for {config.crop}")
    model = DiseaseClassifier(
        architecture=config.model_architecture,
        num_classes=config.num_classes,
        pretrained=False
    )
    
    model.load_state_dict(torch.load(checkpoint_path, map_location='cpu'))
    model.eval()
    
    # Create dummy input: (Batch Size, Channels, Height, Width)
    dummy_input = torch.randn(1, 3, config.image_size, config.image_size)
    
    print(f"Exporting to ONNX: {output_path}")
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=13,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )
    
    print("Verifying ONNX model...")
    onnx_model = onnx.load(output_path)
    onnx.checker.check_model(onnx_model)
    print("ONNX model is valid.")
    
    # Verify outputs match between PyTorch and ONNXRuntime
    print("Verifying inference parity...")
    ort_session = ort.InferenceSession(output_path)
    
    def to_numpy(tensor):
        return tensor.detach().cpu().numpy() if tensor.requires_grad else tensor.cpu().numpy()

    # PyTorch output
    with torch.no_grad():
        torch_out = model(dummy_input)

    # ONNXRuntime output
    ort_inputs = {ort_session.get_inputs()[0].name: to_numpy(dummy_input)}
    ort_outs = ort_session.run(None, ort_inputs)

    # Compare
    np.testing.assert_allclose(to_numpy(torch_out), ort_outs[0], rtol=1e-03, atol=1e-05)
    print("Exported model has been tested with ONNXRuntime, and the result looks good!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, required=True, help="Path to config")
    parser.add_argument("--checkpoint", type=str, required=True, help="Path to PyTorch checkpoint")
    parser.add_argument("--output", type=str, required=True, help="Path to save output .onnx file")
    
    args = parser.parse_args()
    
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    export_to_onnx(args.config, args.checkpoint, args.output)
