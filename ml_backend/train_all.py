import os
import glob
import subprocess

# List all crop configurations, ignoring label_mapping.yaml
config_files = glob.glob('configs/*.yaml')
config_files = [f for f in config_files if 'label_mapping.yaml' not in f]

# We are already training wheat in the background right now! 
# Let's optionally skip wheat if you want, but for a full run, we can include it.
skip_crops = [] 

for config in config_files:
    crop_name = os.path.basename(config).split('.')[0]
    if crop_name in skip_crops:
        print(f"Skipping {crop_name} (already training)...")
        continue
        
    print(f"\n{'='*50}")
    print(f"Starting Training for Crop: {crop_name.upper()}")
    print(f"Config: {config}")
    print(f"{'='*50}\n")
    
    # Run the training script for this specific crop
    import sys
    subprocess.run([sys.executable, 'src/train.py', '--config', config])
    
print("\nAll crops have been successfully trained!")
