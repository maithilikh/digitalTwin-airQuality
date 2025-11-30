# File: backend/llm_config.py
# Description: LLM + global geocoding + Open-Meteo weather integration (FULL ASYNC SAFE)

import torch
import httpx
import requests
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_NAME = "google/flan-t5-base"

# Load model once
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(DEVICE)
model.eval()

# ================================================================
# 1. LOCATION EXTRACTION
# ================================================================
def extract_location_from_prompt(prompt: str) -> str:
    instruction = (
        "Extract ONLY the location mentioned in this text. "
        "Do not add extra words. Return a single place name. "
        "If no location exists, return NONE.\n\n"
        f"User text: {prompt}"
    )

    inputs = tokenizer(instruction, return_tensors="pt").to(DEVICE)
    output = model.generate(**inputs, max_length=40, temperature=0.3, top_p=0.9)
    location = tokenizer.decode(output[0], skip_special_tokens=True).strip()

    return None if "none" in location.lower() else location


# ================================================================
# 2. GEOCODE USING NOMINATIM — Async + Works Globally
# ================================================================
async def geocode_location(location: str):
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": location, "format": "json", "limit": 1}
    headers = {"User-Agent": "weather-ai/1.0"}

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params, headers=headers, timeout=10)
            data = resp.json()

            if not data:
                return None

            best = data[0]
            return {
                "name": best.get("display_name", location),
                "lat": float(best["lat"]),
                "lon": float(best["lon"]),
                "country": best.get("display_name", "").split(",")[-1].strip()
            }
    except:
        return None


# ================================================================
# 3. WEATHER FROM OPEN-METEO (sync - API is fast)
# ================================================================
def fetch_weather(lat: float, lon: float):
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        "&current_weather=true"
        "&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,"
        "precipitation_probability,weathercode,cloudcover,uv_index"
    )
    try:
        r = requests.get(url, timeout=8)
        return r.json()
    except:
        return None


# ================================================================
# 4. LLM WEATHER ANSWER
# ================================================================
def build_weather_answer(prompt: str, weather: dict, place: dict) -> str:
    temp = weather["current_weather"]["temperature"]
    wind = weather["current_weather"]["windspeed"]
    code = weather["current_weather"]["weathercode"]

    hourly = weather.get("hourly", {})
    def safe(key, default=0):
        arr = hourly.get(key, [])
        return arr[0] if arr else default

    feels = safe("apparent_temperature", temp)
    humidity = safe("relativehumidity_2m", 50)
    rain = safe("precipitation_probability", 0)
    clouds = safe("cloudcover", 0)
    uv = safe("uv_index", 1)

    # classify sky text
    code_map = {
        0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
        51: "light drizzle", 61: "rainy", 80: "light showers", 95: "stormy"
    }
    desc = code_map.get(code, "changing weather")

    # ✨ AI-friendly natural-language weather summary ✨
    raw_summary = (
        f"In {place['name']}, the current temperature is {temp}°C, "
        f"and it feels like {feels}°C. "
        f"The humidity is around {humidity}%, and winds are blowing at about {wind} km/h. "
        f"The sky is {desc} with approximately {clouds}% cloud cover. "
        f"There is a {rain}% chance of rain. "
        f"The UV index is {uv}, which means sun exposure risk is low."
    )

    # ✨ FLAN: rewrite into polished natural language
    instruction = (
        "Rewrite the following weather summary into smooth, natural conversational English. "
        "Do NOT add information. Do NOT change numbers. Just make it sound natural:\n\n"
        f"{raw_summary}\n\n"
        "Rewrite it:"
    )

    inputs = tokenizer(instruction, return_tensors="pt").to(DEVICE)
    output = model.generate(
        **inputs,
        max_length=250,
        temperature=0.7,
        top_p=0.92,
        do_sample=True
    )

    return tokenizer.decode(output[0], skip_special_tokens=True).strip()


# ================================================================
# 5. MAIN PIPELINE (ASYNC)
# ================================================================
async def process_weather_prompt(prompt: str) -> str:
    location = extract_location_from_prompt(prompt)
    if not location:
        return "I couldn't detect a location in your question. Please mention where."

    place = await geocode_location(location)
    if not place:
        return f"I couldn't find where '{location}' is located."

    weather = fetch_weather(place["lat"], place["lon"])
    if not weather:
        return "Weather service unavailable right now."

    return build_weather_answer(prompt, weather, place)
