import os
import subprocess

def run_training(crop_yaml):
    print(f"=====================================")
    print(f"Starting training for {crop_yaml}")
    print(f"=====================================")
    
    python_exe = r"e:\KisanMitra - Enigma\Disease-Diagnosis\.venv\Scripts\python.exe"
    script = "src/train.py"
    
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["WANDB_MODE"] = "offline"
    
    result = subprocess.run(
        [python_exe, script, "--config", crop_yaml], 
        env=env,
        capture_output=False
    )
    
    if result.returncode != 0:
        print(f"Error training {crop_yaml}")
    else:
        print(f"Finished training {crop_yaml}")

if __name__ == "__main__":
    configs = [
        "configs/maize.yaml",
        "configs/cotton.yaml",
        "configs/wheat.yaml"
    ]
    for c in configs:
        run_training(c)
