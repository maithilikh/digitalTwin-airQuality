# File: src/urban_air_quality_digital_twin/tools/data_server.py
# Description: Serves processed and predicted data files via FastAPI endpoints

import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi import Query
import httpx
from typing import Optional

# EPA AQI categories
AQI_CATEGORIES = [
    (0, 50, 'Good'),
    (51, 100, 'Moderate'),
    (101, 150, 'Unhealthy for Sensitive Groups'),
    (151, 200, 'Unhealthy'),
    (201, 300, 'Very Unhealthy'),
    (301, 500, 'Hazardous'),
]

def get_aqi_category(aqi: int) -> str:
    for low, high, cat in AQI_CATEGORIES:
        if low <= aqi <= high:
            return cat
    return 'Unknown'

async def reverse_geocode(lat: float, lng: float) -> Optional[str]:
    url = f'https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json&zoom=10&addressdetails=1'
    headers = {'User-Agent': 'air-quality-app/1.0'}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            address = data.get('address', {})
            for key in [
                'city', 'town', 'village', 'municipality', 'county', 'region',
                'state', 'province', 'locality', 'suburb', 'hamlet', 'country'
            ]:
                if key in address:
                    return address[key]
    return None

async def fetch_openmeteo(lat: float, lng: float) -> Optional[dict]:
    # Open-Meteo docs: https://open-meteo.com/en/docs/air-quality-api
    url = (
        f'https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lng}'
        '&hourly=pm10,pm2_5,us_aqi&current_weather=true&timezone=auto'
    )
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
        if resp.status_code == 200:
            return resp.json()
    return None

async def fetch_weather(lat: float, lng: float) -> Optional[dict]:
    url = f'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current_weather=true'
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
        if resp.status_code == 200:
            return resp.json()
    return None

app = FastAPI()

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/processed')

@app.get("/data/processed/{filename}")
def get_processed_file(filename: str):
    file_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "File not found"}

@app.get('/api/get-city-data')
async def get_city_data(lat: float = Query(...), lng: float = Query(...)):
    """
    Given lat/lng, returns city name, AQI, weather, and AQI category.
    """
    print(f"Received request for lat={lat}, lng={lng}")
    city = await reverse_geocode(lat, lng)
    print(f"Nominatim city result: {city}")
    meteo = await fetch_openmeteo(lat, lng)
    print(f"Open-Meteo AQI result: {meteo}")
    if not meteo or meteo.get('error'):
        return {"error": "Failed to fetch Open-Meteo AQI data", "details": meteo}
    # Get current AQI (US EPA)
    aqi = None
    try:
        aqi = int(meteo['hourly']['us_aqi'][0])
    except Exception as e:
        print("AQI parse error:", e)
        aqi = 0
    category = get_aqi_category(aqi)
    # Fetch weather from weather API
    weather = 'Unknown'
    try:
        weather_data = await fetch_weather(lat, lng)
        print(f"Open-Meteo Weather result: {weather_data}")
        if weather_data and 'current_weather' in weather_data:
            temp = weather_data['current_weather']['temperature']
            wind = weather_data['current_weather']['windspeed']
            weather = f"{temp}°C, wind {wind} m/s"
    except Exception as e:
        print("Weather fetch error:", e)
    return {
        "city": city or 'Unknown',
        "aqi": aqi,
        "weather": weather,
        "category": category
    }

# To run:
# uvicorn src.urban_air_quality_digital_twin.tools.data_server:app --reload 