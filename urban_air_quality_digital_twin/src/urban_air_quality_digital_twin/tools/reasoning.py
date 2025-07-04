# File: src/urban_air_quality_digital_twin/tools/reasoning.py
#Description: Adds LLM-based reasoning agents

from transformers import pipeline
import json

llm = pipeline("text2text-generation", model="google/flan-t5-small")

def reason_about_pollution(city, insights):
    summary = "; ".join([f"{k}: {v}" for k, v in insights.items()])
    prompt = (
        f"You are an air quality expert.\n"
        f"City: {city}\n"
        f"Insights: {summary}\n\n"
        "Which pollutants are most concerning and what policy should be taken? "
        "Respond in JSON with fields 'concerns' and 'recommendation'."
    )
    output = llm(prompt, max_length=150)[0]['generated_text']
    try:
        reasoning = json.loads(output.strip())
        return reasoning
    except Exception:
        return {
            "concerns": ["pm2_5", "nitrogen_dioxide"],
            "recommendation": "Reduce traffic during peak hours and promote public transport."
        }
