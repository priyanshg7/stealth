import os
import subprocess

def run_cmd(cmd):
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(f"ERROR: {result.stderr}")
    return result.returncode == 0

print("1. Exporting all models to ONNX...")
run_cmd(r"python export_all_models.py")

print("2. Running End-to-End Validation...")
run_cmd(r"python debug/e2e_tester.py")

print("Pipeline Update Complete!")
