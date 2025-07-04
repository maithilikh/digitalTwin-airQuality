# File: src/urban_air_quality_digital_twin/run_agents.py
# Description: Orchestrates the digital twin workflow using CrewAI agents and the existing data pipeline

import os
import sys
import yaml
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process

# Import pipeline tools as functions
from urban_air_quality_digital_twin.tools.data_fetcher import main as fetch_data_main
from urban_air_quality_digital_twin.tools.preprocess import clean_and_preprocess
from urban_air_quality_digital_twin.tools.prediction import main as prediction_main
from urban_air_quality_digital_twin.tools.reasoning import reason_about_pollution

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

# --- Define tool functions for CrewAI ---
def fetch_data_tool(*args, **kwargs):
    fetch_data_main()
    return "Data fetched."

def preprocess_tool(*args, **kwargs):
    clean_and_preprocess()
    return "Data preprocessed."

def prediction_tool(*args, **kwargs):
    prediction_main()
    return "Prediction, scenario analysis, and visualization complete."

def reasoning_tool(*args, **kwargs):
    city = kwargs.get("city", "Unknown")
    insights = kwargs.get("insights", {})
    return reason_about_pollution(city, insights)

tool_map['reasoning'] = reasoning_tool

# --- Map tool names to functions ---
tool_map = {
    'data_fetcher': fetch_data_tool,
    'preprocess': preprocess_tool,
    'prediction': prediction_tool,
}

# --- Instantiate agents ---
agent_objs = {}
for agent_cfg in agents_config['agents']:
    agent_objs[agent_cfg['name']] = Agent(
        role=agent_cfg['role'],
        goal=agent_cfg['goal'],
        backstory=agent_cfg['backstory'],
        tools=[tool_map[tool] for tool in agent_cfg.get('tools', []) if tool in tool_map]
    )

# --- Instantiate tasks ---
task_objs = []
for task_cfg in tasks_config['tasks']:
    agent = agent_objs.get(task_cfg['agent'])
    if agent:
        task_objs.append(Task(
            description=task_cfg['description'],
            agent=agent,
            expected_output="Task completed."
        ))

# --- Create and run the CrewAI workflow ---
crew = Crew(
    agents=list(agent_objs.values()),
    tasks=task_objs,
    process=Process.sequential
)

if __name__ == "__main__":
    print("Starting Digital Twin CrewAI Orchestration...")
    crew.kickoff()
    print("All steps completed.")
