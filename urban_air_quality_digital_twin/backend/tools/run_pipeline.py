import subprocess
import os

CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"]
PROCESSED_DIR = os.path.join(os.path.dirname(__file__), '../../../data/processed')

print("--- Running Data Fetcher ---")
subprocess.run(["python", "data_fetcher.py"], check=True, cwd=os.path.dirname(__file__))

print("--- Running Preprocessor ---")
subprocess.run(["python", "preprocess.py"], check=True, cwd=os.path.dirname(__file__))

print("--- Running Prediction ---")
subprocess.run(["python", "prediction.py"], check=True, cwd=os.path.dirname(__file__))

print("--- Verifying Output Files ---")
missing = False
for city in CITIES:
    processed = [f for f in os.listdir(PROCESSED_DIR) if f.startswith(city) and f.endswith('_processed.csv')]
    forecast = [f for f in os.listdir(PROCESSED_DIR) if f.startswith(f"{city}_forecast_") and f.endswith('.json')]
    if not processed:
        print(f"[MISSING] No processed CSV for {city}")
        missing = True
    if not forecast:
        print(f"[MISSING] No forecast JSON for {city}")
        missing = True
    if processed and forecast:
        print(f"[OK] {city}: processed CSV and forecast JSON present.")
if not missing:
    print("All required files are present for all cities.")
else:
    print("Some files are missing. Check logs above.") 