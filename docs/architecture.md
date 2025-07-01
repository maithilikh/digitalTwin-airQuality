# File: docs/architecture.md

# Description: Technical architecture for Urban Air Quality Digital Twin backend

## Overview

This document describes the backend architecture, data flow, agent orchestration, and integration points for the Urban Air Quality Digital Twin project.

---

## Data Flow

1. **Data Ingestion**
   - The `DataCollector` agent fetches real-time air quality and weather data from the Open-Meteo API for configured cities.
   - Raw data is stored as CSV in `data/raw/`.
2. **Data Preprocessing**
   - The `DataCollector` agent preprocesses raw data: cleaning, normalizing, and handling missing values.
   - Processed data is saved as CSV in `data/processed/`.
3. **Predictive Modeling**
   - The `Predictor` agent uses a Hugging Face LLM (e.g., google/flan-t5-large) to generate air quality forecasts and answer scenario queries.
   - Forecasts and scenario results are saved as JSON in `data/processed/`.
4. **Backend Data Serving**
   - Processed and predicted data are made available for visualization/UI via files in `data/processed/`.
   - Optionally, a FastAPI backend can expose API endpoints for data access (see below).

---

## Agent Roles

- **DataCollector**
  - Role: Data Ingestion Agent
  - Goal: Fetch and store real-time air quality and weather data for specified cities.
  - Tools: `data_fetcher`, `preprocess`, `data_server`
- **Predictor**
  - Role: Predictive Modeling Agent
  - Goal: Generate air quality forecasts and perform scenario analysis.
  - Tools: `prediction`

---

## Tools

- **data_fetcher**: Fetches air quality and weather data from Open-Meteo API.
- **preprocess**: Cleans and normalizes raw data for modeling and visualization.
- **prediction**: Uses a Hugging Face LLM to forecast air quality and answer 'what-if' scenarios.
- **data_server**: (Optional) Serves processed and predicted data via API endpoints.

---

## API Endpoints (Optional)

If API access is required, add the following FastAPI app (example):

```
# File: src/urban_air_quality_digital_twin/data_server.py
from fastapi import FastAPI
from fastapi.responses import FileResponse
import os

app = FastAPI()

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/processed')

@app.get("/data/processed/{filename}")
def get_processed_file(filename: str):
    file_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "File not found"}
```

- **GET /data/processed/{filename}**: Download processed or predicted data file (CSV/JSON).
- Data files are named as `{city}_YYYYMMDDTHHMMSSZ_processed.csv` or `{city}_forecast_YYYYMMDDTHHMMSSZ.json`.

---

## Integration Points

- **Person 2 (Visualization/UI)**: Reads data from `data/processed/` or via API endpoints.
- **CrewAI**: Orchestrates agents and tasks as defined in `agents.yaml` and `tasks.yaml`.

---

## File Formats

- **Processed Data**: CSV, columns include normalized air quality metrics, city, timestamp.
- **Predictions**: JSON, keys: `pm2_5`, `pm10`, `nitrogen_dioxide`, each with 24 hourly values.

---

## Extensibility

- Add more cities by updating the `.env` and `CITY_COORDS` in `data_fetcher.py`.
- Add new scenario queries in `prediction.py`.
- Extend API endpoints as needed for dashboard/UI requirements.
