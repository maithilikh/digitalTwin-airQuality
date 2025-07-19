import os
import glob
import json
import pandas as pd
from fastapi import FastAPI, Query, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')
RAW_DIR = os.path.join(DATA_DIR, 'raw')
PLOTS_DIR = os.path.join(PROCESSED_DIR, 'plots')

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helpers ---
def get_latest_processed_file(city: str) -> str:
    files = glob.glob(os.path.join(PROCESSED_DIR, f"{city}_*_processed.csv"))
    if not files:
        raise HTTPException(status_code=404, detail=f"No processed data for {city}")
    return max(files, key=os.path.getmtime)

def get_latest_forecast_file(city: str) -> str:
    files = glob.glob(os.path.join(PROCESSED_DIR, f"{city}_forecast_*.json"))
    if not files:
        raise HTTPException(status_code=404, detail=f"No forecast data for {city}")
    return max(files, key=os.path.getmtime)

def get_latest_scenario_file(city: str) -> str:
    files = glob.glob(os.path.join(PROCESSED_DIR, f"{city}_scenario_*.json"))
    if not files:
        raise HTTPException(status_code=404, detail=f"No scenario data for {city}")
    return max(files, key=os.path.getmtime)

def get_available_cities() -> List[str]:
    files = glob.glob(os.path.join(PROCESSED_DIR, "*_processed.csv"))
    return sorted(list({os.path.basename(f).split('_')[0] for f in files}))

# --- API Endpoints ---
@app.get("/api/cities")
def get_cities() -> List[str]:
    return get_available_cities()

@app.get("/api/city/{city}/current")
def get_current_city_data(city: str) -> Dict[str, Any]:
    file = get_latest_processed_file(city)
    df = pd.read_csv(file)
    latest = df.iloc[-1]
    pollutants = {k: latest[k] for k in ['pm2_5', 'pm10', 'o3', 'no2', 'so2', 'co'] if k in latest}
    return {
        "aqi": float(latest.get('aqi', 0)),
        "temperature": float(latest.get('temperature', 0)),
        "humidity": float(latest.get('humidity', 0)),
        "windSpeed": float(latest.get('wind_speed', 0)),
        "pollutants": pollutants,
        "timestamp": latest.get('timestamp', None)
    }

@app.get("/api/city/{city}/trend")
def get_city_trend(city: str) -> Dict[str, List[float]]:
    file = get_latest_processed_file(city)
    df = pd.read_csv(file)
    trend = df['aqi'].tail(24).tolist() if 'aqi' in df else []
    return {"trend": trend}

@app.get("/api/city/{city}/forecast")
def get_city_forecast(city: str, range: str = Query("7d")) -> Dict[str, List[float]]:
    file = get_latest_forecast_file(city)
    with open(file, 'r') as f:
        forecast = json.load(f)
    # Return all by default; optionally filter by range
    return {"forecast": forecast.get('aqi', list(forecast.values())[0] if forecast else [])}

@app.get("/api/city/{city}/pollutants")
def get_city_pollutants(city: str) -> Dict[str, float]:
    file = get_latest_processed_file(city)
    df = pd.read_csv(file)
    latest = df.iloc[-1]
    return {k: float(latest[k]) for k in ['pm2_5', 'pm10', 'o3', 'no2', 'so2', 'co'] if k in latest}

@app.get("/api/map/locations")
def get_map_locations() -> List[Dict[str, Any]]:
    cities = get_available_cities()
    locations = []
    for city in cities:
        file = get_latest_processed_file(city)
        df = pd.read_csv(file)
        latest = df.iloc[-1]
        locations.append({
            "city": city,
            "lat": float(latest.get('lat', 0)),
            "lng": float(latest.get('lon', 0)),
            "aqi": float(latest.get('aqi', 0)),
            "weather": latest.get('weather', ''),
            "category": latest.get('aqi_category', '')
        })
    return locations

@app.get("/api/city/{city}/historical")
def get_historical(city: str, pollutant: str, time_range: str) -> Dict[str, Any]:
    file = get_latest_processed_file(city)
    df = pd.read_csv(file)
    days = 7 if time_range == '7d' else 30 if time_range == '30d' else 90
    df = df.tail(days)
    if pollutant in df.columns:
        data = df[pollutant].tolist()
        return {
            pollutant: data,
            'dates': df['timestamp'].tolist() if 'timestamp' in df.columns else list(range(len(df)))
        }
    else:
        return {
            'dates': df['timestamp'].tolist() if 'timestamp' in df.columns else list(range(len(df)))
        }

@app.post("/api/llm/query")
def llm_query(query: Dict[str, str] = Body(...)) -> Dict[str, str]:
    # TODO: Integrate with CrewAI LLM for real responses
    # For now, return a mock response
    return {
        "response": f"Based on the current air quality data, here's my analysis of '{query.get('query', '')}': The air quality patterns show that pollution levels are influenced by traffic patterns, weather conditions, and industrial activity. For specific health recommendations, consider the current AQI level and adjust outdoor activities accordingly."
    }

@app.get("/api/city/{city}/insights")
def get_city_insights(city: str) -> Dict[str, Any]:
    # TODO: Load from LLM analysis files when available
    return {
        "summary": f"Air quality in {city} is currently moderate with PM2.5 levels elevated due to increased traffic and stagnant weather conditions.",
        "health": "Sensitive individuals should limit outdoor activities. Consider wearing a mask during peak traffic hours.",
        "recommendations": [
            "Keep windows closed during peak pollution hours",
            "Use air purifiers indoors",
            "Avoid outdoor exercise before 10 AM",
            "Stay hydrated to help your body process pollutants"
        ],
        "trend": "Pollution levels are expected to decrease by 15% over the next 24 hours due to incoming wind patterns."
    }

@app.get("/api/compare")
def compare_cities(city1: str, city2: str) -> Dict[str, Any]:
    try:
        city1_data = get_current_city_data(city1)
        city2_data = get_current_city_data(city2)
        
        # TODO: Integrate with CrewAI LLM for real comparison analysis
        ai_comparison = f"Comparing {city1} and {city2}: {city1} has an AQI of {city1_data['aqi']} while {city2} has an AQI of {city2_data['aqi']}. The difference in air quality is primarily due to local weather conditions and traffic patterns."
        
        return {
            "city1": city1_data,
            "city2": city2_data,
            "ai_comparison": ai_comparison
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/city/{city}/scenario")
def scenario_analysis(city: str, params: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    # TODO: Integrate with CrewAI scenario analysis
    # For now, return mock impact analysis
    traffic_impact = (100 - params.get('traffic', 50)) * 0.3
    industrial_impact = (100 - params.get('industrial', 50)) * 0.4
    population_impact = (100 - params.get('population', 50)) * 0.1
    
    overall_improvement = min(60, max(0, traffic_impact + industrial_impact + population_impact))
    
    return {
        "impact": {
            "overall_improvement": round(overall_improvement),
            "pm25_reduction": round(overall_improvement * 0.8),
            "health_risk": round(overall_improvement * 1.2)
        },
        "ai_analysis": f"Scenario analysis for {city} shows a potential {round(overall_improvement)}% improvement in air quality with the given parameters. Traffic reduction would contribute most significantly to improvement."
    }

@app.get("/api/status")
def get_status() -> Dict[str, str]:
    return {
        "pipeline": "Operational",
        "ai": "Active", 
        "uptime": "99.9%"
    }

@app.get("/api/export/dashboard")
def export_dashboard() -> Dict[str, Any]:
    cities = get_available_cities()
    export_data = {
        "timestamp": pd.Timestamp.now().isoformat(),
        "cities": cities,
        "data": {}
    }
    
    for city in cities:
        try:
            export_data["data"][city] = {
                "current": get_current_city_data(city),
                "trend": get_city_trend(city),
                "forecast": get_city_forecast(city),
                "pollutants": get_city_pollutants(city)
            }
        except Exception as e:
            export_data["data"][city] = {"error": str(e)}
    
    return export_data