# File: src/urban_air_quality_digital_twin/tools/data_server.py
# Description: Serves processed and predicted data files via FastAPI endpoints

import os
import pandas as pd
from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict
from urban_air_quality_digital_twin.tools.prediction import interpret_scenario, simulate_what_if

app = FastAPI()

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/processed')


# === API to get processed/predicted files ===
@app.get("/data/processed/{filename}")
def get_processed_file(filename: str):
    file_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "File not found"}


# === Pydantic model for simulation request ===
class ScenarioRequest(BaseModel):
    city: str
    pollutant: str
    scenario: str


# === Simulation endpoint using LLM ===
@app.post("/simulate/")
def simulate(req: ScenarioRequest) -> Dict:
    # Find the latest processed file for the given city
    matching_files = [
        f for f in os.listdir(DATA_DIR)
        if f.startswith(req.city) and f.endswith('_processed.csv')
    ]
    if not matching_files:
        return {"error": f"No processed data found for city {req.city}"}

    latest_file = max(
        matching_files,
        key=lambda f: os.path.getmtime(os.path.join(DATA_DIR, f))
    )
    df_path = os.path.join(DATA_DIR, latest_file)
    df = pd.read_csv(df_path)

    # Use simulation + interpretation
    forecast = simulate_what_if(df, req.pollutant, req.scenario)
    modifiers = interpret_scenario(req.scenario)

    return {"forecast": forecast, "scenario_modifiers": modifiers}
