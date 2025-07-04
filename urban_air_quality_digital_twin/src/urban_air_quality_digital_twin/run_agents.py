# File: src/urban_air_quality_digital_twin/run_agents.py
# Description: Orchestrates the digital twin workflow using CrewAI agents and the existing data pipeline

import os
import sys
import yaml
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from typing import Type

# Import pipeline tools as functions
from tools.data_fetcher import main as fetch_data_main
from tools.preprocess import clean_and_preprocess
from tools.prediction import main as prediction_main
from tools.data_server import app as data_server_app

# Import LLM configuration
from llm_config import get_llm_config, MODEL_INFO

CONFIG_DIR = os.path.join(os.path.dirname(__file__), 'config')
AGENTS_PATH = os.path.join(CONFIG_DIR, 'agents.yaml')
TASKS_PATH = os.path.join(CONFIG_DIR, 'tasks.yaml')

load_dotenv()

# --- Load agent and task configs ---
def load_yaml(path):
    with open(path, 'r') as f:
        return yaml.safe_load(f)

agents_config = load_yaml(AGENTS_PATH)
tasks_config = load_yaml(TASKS_PATH)

# --- Define CrewAI tools ---
class DataFetcherTool(BaseTool):
    name: str = "Data Fetcher"
    description: str = "Fetches real-time air quality and weather data for specified cities"
    
    def _run(self, *args, **kwargs):
        fetch_data_main()
        return "Data fetched successfully from APIs and stored in data/raw/"

class PreprocessTool(BaseTool):
    name: str = "Data Preprocessor"
    description: str = "Cleans, normalizes, and preprocesses raw air quality data"
    
    def _run(self, *args, **kwargs):
        clean_and_preprocess()
        return "Data preprocessed and stored in data/processed/"

class PredictionTool(BaseTool):
    name: str = "Air Quality Predictor"
    description: str = "Generates air quality forecasts and performs scenario analysis"
    
    def _run(self, *args, **kwargs):
        prediction_main()
        return "Predictions, scenario analysis, and visualizations completed"

class DataServerTool(BaseTool):
    name: str = "Data Server"
    description: str = "Serves processed and predicted data via API endpoints"
    
    def _run(self, *args, **kwargs):
        # Note: This would typically start the FastAPI server
        # For now, we'll just return a message indicating the server is ready
        return "Data server endpoints are available for accessing processed data"

# --- Map tool names to tool classes ---
tool_map = {
    'data_fetcher': DataFetcherTool(),
    'preprocess': PreprocessTool(),
    'prediction': PredictionTool(),
    'data_server': DataServerTool(),
}

# --- Get LLM configuration ---
llm_config = get_llm_config()

# --- Instantiate agents ---
agent_objs = {}
for agent_cfg in agents_config['agents']:
    tools = []
    for tool_name in agent_cfg.get('tools', []):
        if tool_name in tool_map:
            tools.append(tool_map[tool_name])
    
    agent_kwargs = {
        'role': agent_cfg['role'],
        'goal': agent_cfg['goal'],
        'backstory': agent_cfg['backstory'],
        'tools': tools
    }
    
    # Add LLM configuration if available
    if llm_config:
        agent_kwargs.update(llm_config)
    
    agent_objs[agent_cfg['name']] = Agent(**agent_kwargs)

# --- Instantiate tasks ---
task_objs = []
for task_cfg in tasks_config['tasks']:
    agent = agent_objs.get(task_cfg['agent'])
    if agent:
        task_objs.append(Task(
            description=task_cfg['description'],
            agent=agent,
            expected_output="Task completed successfully."
        ))

# --- Create and run the CrewAI workflow ---
crew = Crew(
    agents=list(agent_objs.values()),
    tasks=task_objs,
    process=Process.sequential
)

if __name__ == "__main__":
    print("Starting Digital Twin CrewAI Orchestration...")
    print("Digital Twin Components:")
    print("1. Data Collection (Real-time sensors)")
    print("2. Data Processing (Cleaning & normalization)")
    print("3. Predictive Modeling (Forecasting & scenarios)")
    print("4. Visualization & Analysis")
    print("-" * 50)
    
    # Display LLM information
    print(f"Using LLM: {MODEL_INFO['name']}")
    print(f"Model Type: {MODEL_INFO['type']}")
    llm = llm_config.get('llm')
    # print(f"Device: {llm.device if llm else 'None'}")
    print("-" * 50)
    
    result = crew.kickoff()
    print("All Digital Twin workflow steps completed.")
    print("Result:", result)
