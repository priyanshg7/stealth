import torch
import glob
import yaml
import os

for p in glob.glob('models/checkpoints/*/best_model.pth'):
    crop = os.path.basename(os.path.dirname(p))
    checkpoint = torch.load(p, map_location='cpu')
    arch = checkpoint.get('architecture', 'efficientnet_b0')  # Default to b0 if not found
    
    # If the file size is ~43MB, it's definitely b3. If ~16MB, it's b0.
    size = os.path.getsize(p)
    if size > 30_000_000:
        arch = 'efficientnet_b3'
        img_size = 256
    else:
        arch = 'efficientnet_b0'
        img_size = 224
        
    print(f"{crop}: {arch} (size: {size})")
    
    config_path = f'configs/{crop}.yaml'
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        config['model_architecture'] = arch
        config['image_size'] = img_size
        with open(config_path, 'w') as f:
            yaml.dump(config, f, sort_keys=False)
