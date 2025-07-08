# Urban Air Quality Digital Twin [WIP]

## Overview

This project provides the data engineering and backend components for an Urban Air Quality Digital Twin, integrating CrewAI for agent orchestration, data ingestion, preprocessing, predictive modeling, and backend data serving.

## Directory Structure

```
urban_air_quality_digital_twin/
├── .env
├── pyproject.toml
├── requirements.txt
├── data/
│   ├── raw/
│   ├── processed/
├── src/
│   └── urban_air_quality_digital_twin/
│       ├── __init__.py
│       ├── tools/
│       │   ├── __init__.py
│       │   ├── data_fetcher.py
│       │   ├── preprocess.py
│       │   ├── prediction.py
│       ├── config/
│       │   ├── agents.yaml
│       │   └── tasks.yaml
```

## Setup

1. Install dependencies:
   ```sh
   pip install -r requirements.txt
   # or
   pip install uv && uv pip install -r requirements.txt
   ```
2. Configure environment variables in `.env` (see template).
3. Run data ingestion, preprocessing, and prediction scripts as needed:
   ```sh
   python src/urban_air_quality_digital_twin/tools/data_fetcher.py
   python src/urban_air_quality_digital_twin/tools/preprocess.py
   python src/urban_air_quality_digital_twin/tools/prediction.py
   ```

## Backend Data Serving

- Processed and predicted data are saved in `data/processed/` as CSV/JSON for easy access by visualization/UI components.
- For API endpoints, see `docs/architecture.md`.

## CrewAI Orchestration

- Agents and tasks are defined in `src/urban_air_quality_digital_twin/config/agents.yaml` and `tasks.yaml`.

## Documentation

- See `docs/architecture.md` for technical details and data flow.
