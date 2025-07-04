# File: src/urban_air_quality_digital_twin/agents/simulation_analyst.py
# Description: Reads insights from shared memory and generates a basic natural-language report.

from urban_air_quality_digital_twin.shared.memory import agent_messages
import os
from datetime import datetime

REPORTS_DIR = os.path.join(os.path.dirname(__file__), '../../../data/reports')
os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_city_report(city: str):
    insights = agent_messages.get(f"{city}_insight", {})
    
    if not insights:
        return f"No insights available for {city}."

    lines = [f"# Air Quality Report for {city}", "", "## Summary of Trends and Events:"]
    for key, value in insights.items():
        lines.append(f"- **{key}**: {value}")
    
    report_text = "\n".join(lines)
    
    # Save to a markdown file
    timestamp = datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
    report_path = os.path.join(REPORTS_DIR, f"{city}_report_{timestamp}.md")
    with open(report_path, "w") as f:
        f.write(report_text)
    
    print(f"[SimulationAnalyst] Report saved at: {report_path}")
    return report_text

# Optional: Run from CLI
if __name__ == "__main__":
    for city_key in agent_messages.keys():
        if city_key.endswith("_insight"):
            city = city_key.replace("_insight", "")
            generate_city_report(city)
