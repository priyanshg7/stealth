import pandas as pd
import json

def generate_report(metadata_df):
    total_images = len(metadata_df)
    crops = metadata_df['crop'].nunique()
    diseases = metadata_df['disease'].nunique()
    
    healthy = len(metadata_df[metadata_df['disease'] == 'healthy'])
    diseased = total_images - healthy
    
    train_count = len(metadata_df[metadata_df['split'] == 'train'])
    val_count = len(metadata_df[metadata_df['split'] == 'val'])
    test_count = len(metadata_df[metadata_df['split'] == 'test'])
    
    # Basic quality score (100 - penalties)
    # Penalize if healthy is massively larger than diseased, or if highly imbalanced
    score = 100
    if healthy > diseased * 2: score -= 10
    if train_count < 1000: score -= 20
    
    html = f"""
    <html>
    <head><title>KisanMitra Dataset Report</title></head>
    <body style="font-family: Arial, sans-serif; margin: 40px;">
        <h1>KisanMitra Dataset Final Report</h1>
        <h2>Quality Score: {score}/100</h2>
        
        <h3>Overview</h3>
        <ul>
            <li>Total Valid Images: {total_images}</li>
            <li>Supported Crops: {crops}</li>
            <li>Unique Diseases: {diseases}</li>
            <li>Healthy Images: {healthy}</li>
            <li>Disease Images: {diseased}</li>
        </ul>
        
        <h3>Splits</h3>
        <ul>
            <li>Train: {train_count} ({train_count/total_images*100:.1f}%)</li>
            <li>Validation: {val_count} ({val_count/total_images*100:.1f}%)</li>
            <li>Test: {test_count} ({test_count/total_images*100:.1f}%)</li>
        </ul>
        
        <h3>Crop Breakdown</h3>
        <pre>{metadata_df['crop'].value_counts().to_string()}</pre>
    </body>
    </html>
    """
    
    md = f"""
# KisanMitra Dataset Final Report

**Quality Score:** {score}/100

## Overview
* **Total Valid Images:** {total_images}
* **Supported Crops:** {crops}
* **Unique Diseases:** {diseases}
* **Healthy Images:** {healthy}
* **Disease Images:** {diseased}

## Splits
* **Train:** {train_count}
* **Validation:** {val_count}
* **Test:** {test_count}

## Crop Breakdown
```
{metadata_df['crop'].value_counts().to_string()}
```
    """
    
    with open("../data/processed/dataset_report.html", "w") as f:
        f.write(html)
        
    with open("../data/processed/dataset_report.md", "w") as f:
        f.write(md)
        
    print("Dataset report generated: dataset_report.html / .md")

if __name__ == "__main__":
    df = pd.read_csv("../data/processed/metadata.csv")
    generate_report(df)
