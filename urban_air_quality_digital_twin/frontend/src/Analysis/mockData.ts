export const mockForecastData = {
  city: "Mumbai",
  current: {
    aqi: 118, // updated
    pm25: 49, // updated
    pm10: 70, // updated
    ozone: 82, // updated
    temperature: 26, // updated for 1 Dec 2025
    humidity: 60, // updated
    windSpeed: 12.0, // updated
  },
  forecast: {
    "24h": [
      { time: "00:00", aqi: 60, pm25: 17.4, confidence: 0.9 },
      { time: "06:00", aqi: 74, pm25: 20.8, confidence: 0.85 },
      { time: "12:00", aqi: 70, pm25: 19.5, confidence: 0.8 },
      { time: "18:00", aqi: 78, pm25: 22.1, confidence: 0.75 },
      { time: "24:00", aqi: 64, pm25: 18.2, confidence: 0.7 },
    ],
    "48h": [
      { time: "Day 1", aqi: 66, pm25: 18.9, confidence: 0.85 },
      { time: "Day 2", aqi: 60, pm25: 17.4, confidence: 0.75 },
    ],
    "7d": [
      { time: "Mon", aqi: 66, pm25: 18.9, confidence: 0.8 },
      { time: "Tue", aqi: 60, pm25: 17.4, confidence: 0.75 },
      { time: "Wed", aqi: 74, pm25: 20.8, confidence: 0.7 },
      { time: "Thu", aqi: 70, pm25: 19.5, confidence: 0.65 },
      { time: "Fri", aqi: 78, pm25: 22.1, confidence: 0.6 },
      { time: "Sat", aqi: 64, pm25: 18.2, confidence: 0.55 },
      { time: "Sun", aqi: 61, pm25: 17.0, confidence: 0.5 },
    ],
  },
};

export const mockHistoricalData = {
  cities: ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata"],
  pollutants: ["pm25", "pm10", "ozone", "no2", "so2"],
  data: {
    "7d": [
      { date: "2025-12-01", aqi: 66, pm25: 18.9, pm10: 31.8, ozone: 41.7 },
      { date: "2025-12-02", aqi: 60, pm25: 17.4, pm10: 29.1, ozone: 39.2 },
      { date: "2025-12-03", aqi: 74, pm25: 20.8, pm10: 35.2, ozone: 44.8 },
      { date: "2025-12-04", aqi: 70, pm25: 19.5, pm10: 33.0, ozone: 42.6 },
      { date: "2025-12-05", aqi: 78, pm25: 22.1, pm10: 37.6, ozone: 47.1 },
      { date: "2025-12-06", aqi: 64, pm25: 18.2, pm10: 31.2, ozone: 40.4 },
      { date: "2025-12-07", aqi: 61, pm25: 17.0, pm10: 29.4, ozone: 38.9 },
    ],
  },
};
