import os
import glob
import subprocess
import shutil

# Make reports directory in artifacts folder
artifact_dir = r"C:\Users\Kushal Chhabra\.gemini\antigravity-ide\brain\9c3b2772-7e97-419b-8d4c-9e810c8fd10e"

configs = glob.glob('configs/*.yaml')
configs = [c for c in configs if 'label_mapping.yaml' not in c]

for config in configs:
    crop = os.path.basename(config).split('.')[0]
    checkpoint = f"models/checkpoints/{crop}/best_model.pth"
    
    if os.path.exists(checkpoint):
        print(f"Evaluating {crop}...")
        import sys
        subprocess.run([sys.executable, 'src/evaluate.py', '--config', config, '--checkpoint', checkpoint])
        
        # Copy the confusion matrix plot to the artifacts folder for displaying
        src_png = f"reports/{crop}_confusion_matrix.png"
        dst_png = os.path.join(artifact_dir, f"{crop}_confusion_matrix.png")
        if os.path.exists(src_png):
            shutil.copy(src_png, dst_png)
    else:
        print(f"Checkpoint not found for {crop}!")

print("\nEvaluation complete. Check reports/ directory.")
