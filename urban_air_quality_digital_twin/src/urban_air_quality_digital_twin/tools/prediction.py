# File: src/urban_air_quality_digital_twin/tools/prediction.py
# Description: Predicts air quality using scikit-learn models, supports scenario analysis, and visualizes trends.

import os
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from datetime import datetime
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Directories
PROCESSED_DATA_DIR = os.path.join(os.path.dirname(__file__), '../../../data/processed')
PREDICTIONS_DIR = PROCESSED_DATA_DIR
PLOTS_DIR = os.path.join(PROCESSED_DATA_DIR, 'plots')

# Load environment variables
load_dotenv()

# Ensure plots directory exists
os.makedirs(PLOTS_DIR, exist_ok=True)

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
    cities = os.getenv('CITY_LIST', 'London,Paris,New York').split(',')
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
        forecast_path = os.path.join(PREDICTIONS_DIR, f"{city}_forecast_{timestamp}.json")
        scenario_path = os.path.join(PREDICTIONS_DIR, f"{city}_scenario_{timestamp}.json")

        pd.Series(forecast).to_json(forecast_path)
        pd.Series(scenario).to_json(scenario_path)

        print(f"Saved forecast to {forecast_path}")
        print(f"Saved scenario simulation to {scenario_path}")

if __name__ == "__main__":
    main()
