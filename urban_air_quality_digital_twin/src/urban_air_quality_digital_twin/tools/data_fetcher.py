# File: src/urban_air_quality_digital_twin/tools/data_fetcher.py
# Description: Fetches air quality and weather data from Open-Meteo API

import os
import requests
import pandas as pd
from datetime import datetime
from time import sleep
from dotenv import load_dotenv

RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/raw')

load_dotenv()

# OPEN_METEO_API_KEY = os.getenv('OPEN_METEO_API_KEY')
CITY_LIST = os.getenv('CITY_LIST', 'London,Paris,New York').split(',')
FETCH_INTERVAL = int(os.getenv('DATA_FETCH_INTERVAL_MINUTES', '60'))

CITY_COORDS = {
    'London': {'lat': 51.5074, 'lon': -0.1278},
    'Paris': {'lat': 48.8566, 'lon': 2.3522},
    'New York': {'lat': 40.7128, 'lon': -74.0060},
    'Bangalore': {'lat': 12.9716, 'lon': 77.5946},
    'Mumbai': {'lat': 19.0760, 'lon': 72.8777},
    'Delhi': {'lat': 28.6139, 'lon': 77.2090},
    'Chennai': {'lat': 13.0827, 'lon': 80.2707},
    'Kolkata': {'lat': 22.5726, 'lon': 88.3639},
}

API_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"


def fetch_city_data(city, lat, lon, retries=3, delay=5):
    params = {
        'latitude': lat,
        'longitude': lon,
        'hourly': 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide',
        'timezone': 'auto',
    }
    for attempt in range(retries):
        try:
            response = requests.get(API_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data
        except Exception as e:
            print(f"Error fetching data for {city} (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                sleep(delay)
            else:
                return None


def save_raw_data(city, data):
    timestamp = datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
    filename = f"{city}_{timestamp}.csv"
    filepath = os.path.join(RAW_DATA_DIR, filename)
    if 'hourly' in data:
        df = pd.DataFrame(data['hourly'])
        df['city'] = city
        df['timestamp'] = timestamp
        df.to_csv(filepath, index=False)
        print(f"Saved raw data for {city} to {filepath}")
    else:
        print(f"No hourly data found for {city}")


def main():
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    for city in CITY_LIST:
        city = city.strip()
        coords = CITY_COORDS.get(city)
        if not coords:
            print(f"Coordinates for {city} not found. Skipping.")
            continue
        data = fetch_city_data(city, coords['lat'], coords['lon'])
        if data:
            save_raw_data(city, data)

if __name__ == "__main__":
    main()
