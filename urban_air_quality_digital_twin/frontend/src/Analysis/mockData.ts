export const mockForecastData = {
  city: 'New York',
  current: {
    aqi: 65,
    pm25: 18.5,
    pm10: 32.1,
    ozone: 42.3,
    temperature: 22,
    humidity: 65,
    windSpeed: 8.5
  },
  forecast: {
    '24h': [
      { time: '00:00', aqi: 58, pm25: 16.2, confidence: 0.9 },
      { time: '06:00', aqi: 72, pm25: 21.1, confidence: 0.85 },
      { time: '12:00', aqi: 68, pm25: 19.8, confidence: 0.8 },
      { time: '18:00', aqi: 75, pm25: 22.5, confidence: 0.75 },
      { time: '24:00', aqi: 62, pm25: 17.9, confidence: 0.7 }
    ],
    '48h': [
      { time: 'Day 1', aqi: 65, pm25: 18.5, confidence: 0.85 },
      { time: 'Day 2', aqi: 58, pm25: 16.2, confidence: 0.75 }
    ],
    '7d': [
      { time: 'Mon', aqi: 65, pm25: 18.5, confidence: 0.8 },
      { time: 'Tue', aqi: 58, pm25: 16.2, confidence: 0.75 },
      { time: 'Wed', aqi: 72, pm25: 21.1, confidence: 0.7 },
      { time: 'Thu', aqi: 68, pm25: 19.8, confidence: 0.65 },
      { time: 'Fri', aqi: 75, pm25: 22.5, confidence: 0.6 },
      { time: 'Sat', aqi: 62, pm25: 17.9, confidence: 0.55 },
      { time: 'Sun', aqi: 59, pm25: 16.8, confidence: 0.5 }
    ]
  }
};

export const mockHistoricalData = {
  cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
  pollutants: ['pm25', 'pm10', 'ozone', 'no2', 'so2'],
  data: {
    '7d': [
      { date: '2024-01-01', aqi: 65, pm25: 18.5, pm10: 32.1, ozone: 42.3 },
      { date: '2024-01-02', aqi: 58, pm25: 16.2, pm10: 28.9, ozone: 38.7 },
      { date: '2024-01-03', aqi: 72, pm25: 21.1, pm10: 35.6, ozone: 45.2 },
      { date: '2024-01-04', aqi: 68, pm25: 19.8, pm10: 33.4, ozone: 43.1 },
      { date: '2024-01-05', aqi: 75, pm25: 22.5, pm10: 38.2, ozone: 47.8 },
      { date: '2024-01-06', aqi: 62, pm25: 17.9, pm10: 31.5, ozone: 40.9 },
      { date: '2024-01-07', aqi: 59, pm25: 16.8, pm10: 29.7, ozone: 39.4 }
    ]
  }
};