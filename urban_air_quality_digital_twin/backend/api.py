from fastapi import FastAPI, Query, Body
from typing import List, Dict, Any
from tools.data_fetcher import fetch_city_data, save_raw_data  # Import both function
from tools.data_server import get_city_data, fetch_weather
from llm_config import query_huggingface_model, parse_llm_response

app = FastAPI()

# Example coordinates dictionary (replace with your actual logic)
coords = {
    "New York": {"lat": 40.7128, "lon": -74.0060},
    "Los Angeles": {"lat": 34.0522, "lon": -118.2437},
    'London': {'lat': 51.5074, 'lon': -0.1278},
    'Paris': {'lat': 48.8566, 'lon': 2.3522},
    'New York': {'lat': 40.7128, 'lon': -74.0060},
    'Bangalore': {'lat': 12.9716, 'lon': 77.5946},
    'Mumbai': {'lat': 19.0760, 'lon': 72.8777},
    'Delhi': {'lat': 28.6139, 'lon': 77.2090},
    'Chennai': {'lat': 13.0827, 'lon': 80.2707},
    # ...other cities...
}

@app.get("/api/cities")
def get_cities() -> List[str]:
    return ["New York", "Los Angeles", "Chicago", "Miami", "Seattle", "Denver"]

@app.get("/api/city/{city}/current")
def get_current_city_data(city: str) -> Dict[str, Any]:
    if city not in coords:
        return {"error": "Unknown city"}
    data = fetch_city_data(city, coords[city]['lat'], coords[city]['lon'])
    if data:
            save_raw_data(city, data)
    return data

@app.get('/api/get-city-data')
async def get_city_data_endpoint(lat: float, lng: float) -> Dict[str, Any]:
    data = await get_city_data(lat, lng)
    return data

@app.get("/api/city/{city}/trend")
def get_city_trend(city: str) -> Dict[str, List[float]]:
    return {"trend": []}

@app.get("/api/city/{city}/forecast")
def get_city_forecast(city: str, range: str = Query("7d")) -> Dict[str, List[float]]:
    return {"forecast": []}

@app.get("/api/city/{city}/pollutants")
def get_city_pollutants(city: str) -> Dict[str, float]:
    return {}

@app.get("/api/compare")
def compare_cities(city1: str, city2: str) -> Dict[str, Any]:
    return {"city1": {}, "city2": {}, "ai_comparison": ""}

@app.get("/api/map/locations")
def get_map_locations() -> List[Dict[str, Any]]:
    return []

@app.post("/api/llm/query")
def llm_query(query: str = Body(...)) -> Dict[str, str]:
    return {"response": ""}

@app.get("/api/city/{city}/insights")
def get_city_insights(city: str) -> Dict[str, Any]:
    return {"summary": "", "health": "", "recommendations": [], "trend": ""}

@app.get("/api/status")
def get_status() -> Dict[str, str]:
    return {"pipeline": "Operational", "ai": "Active", "uptime": "99.9%"}

@app.get("/api/export/dashboard")
def export_dashboard() -> Dict[str, Any]:
    return {}

@app.get("/api/city/{city}/historical")
def get_historical(city: str, pollutant: str, range: str) -> Dict[str, Any]:
    return {}

@app.post("/api/city/{city}/scenario")
def scenario_analysis(city: str, params: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    return {"impact": {}, "ai_analysis": ""}

@app.post("/api/ask-ai")
def ask_ai(prompt: str = Body(..., embed=True)) -> Dict[str, Any]:
    """
    Accepts a prompt, sends it to the Hugging Face model, and returns the parsed response.
    """
    raw_response = query_huggingface_model(prompt)
    parsed = parse_llm_response(raw_response)
    return {"response": parsed}