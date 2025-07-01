# File: src/urban_air_quality_digital_twin/tools/data_server.py
# Description: Serves processed and predicted data files via FastAPI endpoints

import os
from fastapi import FastAPI
from fastapi.responses import FileResponse

app = FastAPI()

DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/processed')

@app.get("/data/processed/{filename}")
def get_processed_file(filename: str):
    file_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "File not found"}

# To run:
# uvicorn src.urban_air_quality_digital_twin.tools.data_server:app --reload 