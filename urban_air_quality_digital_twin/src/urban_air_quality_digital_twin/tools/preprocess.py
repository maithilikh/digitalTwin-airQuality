# File: src/urban_air_quality_digital_twin/tools/preprocess.py
# Description: Cleans and preprocesses raw air quality data for downstream use

import os
import pandas as pd
import numpy as np
from glob import glob

RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/raw')
PROCESSED_DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/processed')


def clean_and_preprocess():
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    raw_files = glob(os.path.join(RAW_DATA_DIR, '*.csv'))
    for file in raw_files:
        try:
            df = pd.read_csv(file)
            # Drop duplicates
            df = df.drop_duplicates()
            # Fill missing values with forward fill, then zero
            df = df.fillna(method='ffill').fillna(0)
            # Normalize numeric columns (min-max scaling)
            for col in ['pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide', 'ozone', 'sulphur_dioxide']:
                if col in df.columns:
                    min_val = df[col].min()
                    max_val = df[col].max()
                    if max_val > min_val:
                        df[col] = (df[col] - min_val) / (max_val - min_val)
            # Save processed file
            base = os.path.basename(file)
            processed_path = os.path.join(PROCESSED_DATA_DIR, base.replace('.csv', '_processed.csv'))
            df.to_csv(processed_path, index=False)
            print(f"Processed and saved: {processed_path}")
        except Exception as e:
            print(f"Error processing {file}: {e}")

if __name__ == "__main__":
    clean_and_preprocess()
