import os
import json
import glob
import matplotlib.pyplot as plt
import pandas as pd
import pathlib

wandb_dir = 'wandb'
offline_runs = glob.glob(os.path.join(wandb_dir, 'offline-run-*'))

results = []

# Where to save plots
output_dir = r"C:\Users\Kushal Chhabra\.gemini\antigravity-ide\brain\9c3b2772-7e97-419b-8d4c-9e810c8fd10e"

for run_dir in offline_runs:
    try:
        # Get metadata (args)
        with open(os.path.join(run_dir, 'files', 'wandb-metadata.json'), 'r') as f:
            meta = json.load(f)
            # Find the config argument
            config_arg = ""
            args = meta.get('args', [])
            for i, arg in enumerate(args):
                if arg == '--config' and i + 1 < len(args):
                    config_arg = args[i+1]
                    break
            crop_name = os.path.basename(config_arg).replace('.yaml', '') if config_arg else "unknown"
            
        # If it's a crashed run that we restarted, we might have multiple runs for the same crop.
        # We should only keep the one with the most epochs.
        
        # Read history for plotting
        history_file = os.path.join(run_dir, 'files', 'wandb-history.jsonl')
        if not os.path.exists(history_file):
            continue
            
        history = []
        with open(history_file, 'r') as f:
            for line in f:
                history.append(json.loads(line))
        
        df = pd.DataFrame(history)
        if df.empty or 'epoch' not in df.columns:
            continue
            
        # Get best metrics from summary
        summary_file = os.path.join(run_dir, 'files', 'wandb-summary.json')
        with open(summary_file, 'r') as f:
            summary = json.load(f)
            
        epochs_trained = int(df['epoch'].max())
        
        results.append({
            'crop': crop_name.capitalize(),
            'epochs': epochs_trained,
            'train_loss': summary.get('Train Loss', 0),
            'train_acc': summary.get('Train Acc', 0),
            'val_loss': summary.get('Val Loss', 0),
            'val_acc': summary.get('Val Acc', 0),
            'val_f1': summary.get('Val F1', 0),
            'df': df
        })
    except Exception as e:
        print(f"Error processing {run_dir}: {e}")

# Filter to keep only the longest run for each crop (in case of crashes)
best_runs = {}
for r in results:
    c = r['crop']
    if c not in best_runs or r['epochs'] > best_runs[c]['epochs']:
        best_runs[c] = r

# Generate markdown table
md = "| Model (Crop) | Epochs Trained | Train Loss | Train Acc (%) | Val Loss | Val Acc (%) | Val F1 Score |\n"
md += "|---|---|---|---|---|---|---|\n"

for c, r in best_runs.items():
    md += f"| **{c}** | {r['epochs']} | {r['train_loss']:.4f} | {r['train_acc']:.2f}% | {r['val_loss']:.4f} | {r['val_acc']:.2f}% | **{r['val_f1']:.4f}** |\n"
    
    # Generate Plot
    df = r['df']
    plt.figure(figsize=(12, 5))
    
    # Plot Loss
    plt.subplot(1, 2, 1)
    if 'Train Loss' in df.columns:
        plt.plot(df['epoch'], df['Train Loss'], label='Train Loss', color='blue')
    if 'Val Loss' in df.columns:
        plt.plot(df['epoch'], df['Val Loss'], label='Val Loss', color='red')
    plt.title(f'{c} - Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Plot Accuracy
    plt.subplot(1, 2, 2)
    if 'Train Acc' in df.columns:
        plt.plot(df['epoch'], df['Train Acc'], label='Train Acc', color='blue')
    if 'Val Acc' in df.columns:
        plt.plot(df['epoch'], df['Val Acc'], label='Val Acc', color='red')
    plt.title(f'{c} - Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy (%)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plot_path = os.path.join(output_dir, f"{c.lower()}_metrics.png")
    plt.savefig(plot_path, dpi=150)
    plt.close()

print(md)
