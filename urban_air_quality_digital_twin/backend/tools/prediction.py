# File: src/urban_air_quality_digital_twin/tools/prediction.py
# Description: Predicts air quality using scikit-learn models and LLM analysis, supports scenario analysis, and visualizes trends.

import os
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from datetime import datetime
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import json

# Import LLM for enhanced analysis
try:
    from transformers.models.auto.tokenization_auto import AutoTokenizer
    from transformers.models.auto.modeling_auto import AutoModelForSeq2SeqLM
    import torch
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    print("Warning: Transformers not available. LLM analysis will be skipped.")

# Directories
PROCESSED_DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/processed')
PREDICTIONS_DIR = PROCESSED_DATA_DIR
PLOTS_DIR = os.path.join(PROCESSED_DATA_DIR, 'plots')

# Load environment variables
load_dotenv()

# Ensure plots directory exists
os.makedirs(PLOTS_DIR, exist_ok=True)

# LLM Configuration
HUGGINGFACE_MODEL_NAME = "google/flan-t5-base"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

def load_llm():
    """Load the Hugging Face LLM for analysis"""
    if not LLM_AVAILABLE:
        return None
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(HUGGINGFACE_MODEL_NAME)
        model = AutoModelForSeq2SeqLM.from_pretrained(HUGGINGFACE_MODEL_NAME)
        model.to(DEVICE)
        return tokenizer, model
    except Exception as e:
        print(f"Error loading LLM: {e}")
        return None

def generate_llm_analysis(df, city, tokenizer, model):
    """Generate LLM-powered analysis of air quality data"""
    if not tokenizer or not model:
        return "LLM analysis not available"
    
    try:
        # Prepare data summary for LLM
        data_summary = f"""
        Air quality data for {city}:
        - PM2.5 average: {df['pm2_5'].mean():.3f}
        - PM10 average: {df['pm10'].mean():.3f}
        - Nitrogen dioxide average: {df['nitrogen_dioxide'].mean():.3f}
        - Data points: {len(df)}
        - Time range: {df.index[0]} to {df.index[-1]}
        
        Recent trends:
        - PM2.5 trend: {'increasing' if df['pm2_5'].iloc[-24:].mean() > df['pm2_5'].iloc[-48:-24].mean() else 'decreasing'}
        - PM10 trend: {'increasing' if df['pm10'].iloc[-24:].mean() > df['pm10'].iloc[-48:-24].mean() else 'decreasing'}
        """
        
        # Create prompt for analysis
        prompt = f"""
        Analyze this air quality data and provide insights:
        {data_summary}
        
        Please provide:
        1. Health implications
        2. Potential causes
        3. Recommendations for improvement
        """
        
        # Generate response
        inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
        inputs = {k: v.to(DEVICE) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=256,
                temperature=0.7,
                do_sample=True,
                top_p=0.9
            )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response
        
    except Exception as e:
        return f"LLM analysis failed: {e}"

# --- Pattern Detection and Insight Generation ---
def detect_patterns_and_generate_insights(df, city):
    insights = {}
    for col in ['pm2_5', 'pm10', 'nitrogen_dioxide']:
        if col in df.columns:
            # Count high pollution events (above normalized threshold of 0.8)
            high_events = (df[col] > 0.8).sum()
            insights[col] = f"{high_events} high {col} events in recent data."

            # Detect simple trend using linear regression
            y = df[col].values[-48:]
            if len(y) > 1:
                x = np.arange(len(y)).reshape(-1, 1)
                model = LinearRegression().fit(x, y)
                slope = model.coef_[0]
                if slope > 0.01:
                    insights[f"{col}_trend"] = f"Increasing trend in {col}"
                elif slope < -0.01:
                    insights[f"{col}_trend"] = f"Decreasing trend in {col}"
                else:
                    insights[f"{col}_trend"] = f"Stable {col} trend"
    return insights

# --- Visualization ---
def visualize_trends(df, city):
    plt.figure(figsize=(10, 6))
    for col in ['pm2_5', 'pm10', 'nitrogen_dioxide']:
        if col in df.columns:
            plt.plot(df[col].values[-48:], label=col)
    plt.title(f"Air Quality Trends for {city}")
    plt.xlabel("Hour (last 48h)")
    plt.ylabel("Normalized Value")
    plt.legend()
    plot_path = os.path.join(PLOTS_DIR, f"{city}_trend.png")
    plt.savefig(plot_path)
    plt.close()
    print(f"Saved trend plot: {plot_path}")

# --- Forecasting ---
def forecast_next_24h(df, target_col):
    y = df[target_col].values[-48:]
    if len(y) < 2:
        return [float(np.mean(y))] * 24  # fallback
    x = np.arange(len(y)).reshape(-1, 1)
    model = LinearRegression().fit(x, y)
    x_future = np.arange(len(y), len(y) + 24).reshape(-1, 1)
    y_pred = model.predict(x_future)
    y_pred = np.clip(y_pred, 0, 1)
    return y_pred.tolist()

# --- Scenario Simulation ---
def simulate_what_if(df, target_col, scenario_desc):
    y = df[target_col].values[-48:]
    if len(y) < 2:
        return [float(np.mean(y))] * 24
    if "traffic" in scenario_desc.lower() and target_col in ["pm2_5", "pm10", "nitrogen_dioxide"]:
        y = y * 0.8  # Simulate 20% reduction
    x = np.arange(len(y)).reshape(-1, 1)
    model = LinearRegression().fit(x, y)
    x_future = np.arange(len(y), len(y) + 24).reshape(-1, 1)
    y_pred = model.predict(x_future)
    y_pred = np.clip(y_pred, 0, 1)
    return y_pred.tolist()

# --- Main Execution ---
def main():
    print("Loading LLM for enhanced analysis...")
    llm_components = load_llm()
    
    # Only use Indian cities by default
    cities = os.getenv('CITY_LIST', 'Mumbai,Delhi,Bangalore,Chennai,Kolkata').split(',')
    for city in map(str.strip, cities):
        city_files = [
            f for f in os.listdir(PROCESSED_DATA_DIR)
            if city in f and f.endswith('_processed.csv')
        ]
        if not city_files:
            print(f"No processed data found for {city}")
            continue

        latest_file = max(
            city_files,
            key=lambda f: os.path.getmtime(os.path.join(PROCESSED_DATA_DIR, f))
        )
        df = pd.read_csv(os.path.join(PROCESSED_DATA_DIR, latest_file))

        # Detect patterns and generate insights
        insights = detect_patterns_and_generate_insights(df, city)
        print(f"Insights for {city}: {insights}")

        # Generate LLM analysis
        if llm_components:
            tokenizer, model = llm_components
            llm_analysis = generate_llm_analysis(df, city, tokenizer, model)
            print(f"LLM Analysis for {city}: {llm_analysis}")
        else:
            llm_analysis = "LLM analysis not available"

        # Generate trend visualizations
        visualize_trends(df, city)

        # Forecasting
        forecast = {
            col: forecast_next_24h(df, col)
            for col in ['pm2_5', 'pm10', 'nitrogen_dioxide']
            if col in df.columns
        }

        # Scenario simulation
        scenario_desc = "What if traffic is reduced by 30%?"
        scenario = {
            col: simulate_what_if(df, col, scenario_desc)
            for col in ['pm2_5', 'pm10', 'nitrogen_dioxide']
            if col in df.columns
        }

        # Save results
        timestamp = datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
        
        # Save forecast
        forecast_path = os.path.join(PREDICTIONS_DIR, f"{city}_forecast_{timestamp}.json")
        with open(forecast_path, 'w') as f:
            json.dump(forecast, f, indent=2)
        
        # Save scenario
        scenario_path = os.path.join(PREDICTIONS_DIR, f"{city}_scenario_{timestamp}.json")
        with open(scenario_path, 'w') as f:
            json.dump(scenario, f, indent=2)
        
        # Save LLM analysis
        analysis_path = os.path.join(PREDICTIONS_DIR, f"{city}_llm_analysis_{timestamp}.json")
        analysis_data = {
            "city": city,
            "timestamp": timestamp,
            "insights": insights,
            "llm_analysis": llm_analysis,
            "scenario_description": scenario_desc
        }
        with open(analysis_path, 'w') as f:
            json.dump(analysis_data, f, indent=2)

        print(f"Saved forecast to {forecast_path}")
        print(f"Saved scenario simulation to {scenario_path}")
        print(f"Saved LLM analysis to {analysis_path}")

if __name__ == "__main__":
    main()
