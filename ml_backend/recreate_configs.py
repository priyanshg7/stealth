import pandas as pd
import os

df = pd.read_csv('data/processed/metadata.csv')
crops = df['crop'].unique()

for c in crops:
    num_classes = df[df["crop"]==c]["disease"].nunique()
    with open(f'configs/{c}.yaml', 'w') as f:
        f.write(f'crop: "{c}"\n')
        f.write(f'batch_size: 32\n')
        f.write(f'learning_rate: 0.001\n')
        f.write(f'epochs: 50\n')
        f.write(f'image_size: 224\n')
        f.write(f'num_classes: {num_classes}\n')
        f.write(f'model_architecture: "efficientnet_b0"\n')
        f.write(f'pretrained: true\n')
        f.write(f'metadata_path: "data/processed/metadata.csv"\n')
        f.write(f'checkpoint_dir: "models/checkpoints/{c}/"\n')
