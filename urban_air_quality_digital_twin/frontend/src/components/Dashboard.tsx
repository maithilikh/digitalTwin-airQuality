import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Settings,
  Clock,
  MapPin,
  Zap,
  Database,
  Wifi,
  Server,
  Download,
  Send,
  Map,
} from "lucide-react";
import MapView, { MapData } from "./MapView";

const mockCityData = {
  Mumbai: {
    aqi: 82,
    temperature: 26, // updated from 28
    humidity: 60, // rough estimate: partly cloudy
    windSpeed: 12.0, // calm/moderate
    trend: [75, 78, 81, 82, 85, 80, 82, 79, 82],
    forecast: [82, 85, 88, 90, 87, 83, 80],
    pollutants: { pm25: 27, pm10: 58, o3: 85, no2: 30, so2: 15, co: 0.9 },
  },
  Delhi: {
    aqi: 135,
    temperature: 22, // updated from 29
    humidity: 45, // estimated: dry / hazy
    windSpeed: 8.0, // light breeze
    trend: [130, 133, 137, 135, 139, 143, 135, 132, 135],
    forecast: [135, 137, 140, 142, 139, 134, 130],
    pollutants: { pm25: 48, pm10: 80, o3: 138, no2: 58, so2: 20, co: 1.3 },
  },
  Chennai: {
    aqi: 59,
    temperature: 26, // updated from 23
    humidity: 70, // estimated: humid & cloudy/rainy
    windSpeed: 10.0, // moderate
    trend: [60, 58, 57, 59, 61, 58, 59, 56, 59],
    forecast: [59, 61, 64, 67, 62, 58, 55],
    pollutants: { pm25: 13, pm10: 29, o3: 60, no2: 25, so2: 9, co: 0.6 },
  },
  Bengaluru: {
    aqi: 43,
    temperature: 20, // updated from 27
    humidity: 75, // estimated: cloudy & mild humidity
    windSpeed: 9.0, // light to moderate
    trend: [40, 42, 45, 43, 46, 44, 43, 40, 43],
    forecast: [43, 45, 48, 51, 46, 42, 40],
    pollutants: { pm25: 9, pm10: 19, o3: 44, no2: 17, so2: 5, co: 0.35 },
  },
  Kolkata: {
    aqi: 38,
    temperature: 23, // updated from 22
    humidity: 80, // estimated: hazy/cloudy
    windSpeed: 7.0, // light breeze
    trend: [35, 37, 40, 37, 39, 36, 37, 34, 37],
    forecast: [38, 40, 42, 45, 40, 36, 33],
    pollutants: { pm25: 7, pm10: 16, o3: 36, no2: 19, so2: 6, co: 0.45 },
  },
};

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return "text-green-500 bg-green-50 border-green-200";
  if (aqi <= 100) return "text-yellow-500 bg-yellow-50 border-yellow-200";
  if (aqi <= 150) return "text-orange-500 bg-orange-50 border-orange-200";
  if (aqi <= 200) return "text-red-500 bg-red-50 border-red-200";
  if (aqi <= 300) return "text-purple-500 bg-purple-50 border-purple-200";
  return "text-red-800 bg-red-100 border-red-300";
};

const getAQIStatus = (aqi: number) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

const getAQIIcon = (aqi: number) => {
  if (aqi <= 50) return <CheckCircle className="w-5 h-5" />;
  if (aqi <= 100) return <Eye className="w-5 h-5" />;
  if (aqi <= 150) return <AlertTriangle className="w-5 h-5" />;
  return <XCircle className="w-5 h-5" />;
};

const TrendChart = ({
  data,
  color = "blue",
}: {
  data: number[];
  color?: string;
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end space-x-1 h-16">
      {data.map((value, index) => (
        <div
          key={index}
          className={`w-3 bg-${color}-500 rounded-t transition-all duration-300 hover:opacity-80`}
          style={{ height: `${((value - min) / range) * 100}%` }}
        />
      ))}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const location = useLocation(); //Dont delete this line
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [compareCity1, setCompareCity1] = useState("Mumbai");
  const [compareCity2, setCompareCity2] = useState("Delhi");
  const [markerData, setMarkerData] = useState<MapData | null>(null);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentCityData =
    mockCityData[selectedCity as keyof typeof mockCityData];
  const city1Data = mockCityData[compareCity1 as keyof typeof mockCityData];
  const city2Data = mockCityData[compareCity2 as keyof typeof mockCityData];

  // Handler for map click
  const handleMapClick = async (lat: number, lng: number) => {
    setMarkerData(null);
    try {
      const res = await fetch(`/api/get-city-data?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error("Failed to fetch city data");
      const data = await res.json();
      setMarkerData({
        lat,
        lng,
        city: data.city,
        aqi: data.aqi,
        weather: data.weather,
        category: data.category,
      });
    } catch (err) {
      setMarkerData({
        lat,
        lng,
        city: "Unknown",
        aqi: 0,
        weather: "Unknown",
        category: "Good",
      });
    }
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    // Simulate API call to your backend model
    setTimeout(() => {
      setAiResponse(
        `Based on current air quality data, here's my analysis of "${aiQuery}": The air quality patterns show that pollution levels are influenced by traffic patterns, weather conditions, and industrial activity. For specific health recommendations, consider the current AQI level and adjust outdoor activities accordingly.`
      );
      setIsAiLoading(false);
    }, 2000);
  };

  const handleExportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      selectedCity,
      currentData: currentCityData,
      comparison: {
        city1: compareCity1,
        city2: compareCity2,
        data1: city1Data,
        data2: city2Data,
      },
      mapLocation: markerData,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `air-quality-data-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const llmInsights = {
    summary:
      "Air quality is currently moderate with PM2.5 levels elevated due to increased traffic and stagnant weather conditions. Wind patterns suggest improvement over the next 6 hours.",
    healthImplication:
      "Sensitive individuals should limit outdoor activities. Consider wearing a mask during peak traffic hours (7-9 AM, 5-7 PM).",
    recommendations: [
      "Keep windows closed during peak pollution hours",
      "Use air purifiers indoors",
      "Avoid outdoor exercise before 10 AM",
      "Stay hydrated to help your body process pollutants",
    ],
    trend:
      "Pollution levels are expected to decrease by 15% over the next 24 hours due to incoming wind patterns.",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                AirQuality Monitor
              </h1>
            </div>
            {/* <div className="flex items-center space-x-3"> */}
            {/* <Link to="/analysis">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Analysis
          </button>
        </Link> */}
            {/* </div> */}
            <nav className="hidden md:flex space-x-8">
              {/* <a href="#" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">Dashboard</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Analysis</a> */}
              <Link
                to="/"
                className={`${
                  location.pathname === "/"
                    ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-2"
                    : "text-gray-600 hover:text-gray-900"
                } transition-colors`}
              >
                Dashboard
              </Link>
              <Link
                to="/analysis"
                className={`${
                  location.pathname === "/analysis"
                    ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-2"
                    : "text-gray-600 hover:text-gray-900"
                } transition-colors`}
              >
                Analysis
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* City Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Current Location
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Last updated: {currentTime.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {Object.keys(mockCityData).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ask the AI - Moved up for better visibility */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ask the AI</h3>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask about air quality, health impacts, trends, or recommendations..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleAiQuery()}
              />
              <button
                onClick={handleAiQuery}
                disabled={isAiLoading || !aiQuery.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isAiLoading ? "Analyzing..." : "Ask AI"}</span>
              </button>
            </div>

            {aiResponse && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">
                  AI Response:
                </h4>
                <p className="text-sm text-purple-800">{aiResponse}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main AQI Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Current AQI */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>{selectedCity}</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border-2 ${getAQIColor(
                      currentCityData.aqi
                    )}`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      {getAQIIcon(currentCityData.aqi)}
                      <span className="text-sm font-medium">
                        Air Quality Index
                      </span>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {currentCityData.aqi}
                    </div>
                    <div className="text-sm opacity-75">
                      {getAQIStatus(currentCityData.aqi)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600">
                          Temperature
                        </span>
                      </div>
                      <div className="text-xl font-semibold">
                        {currentCityData.temperature}°C
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Humidity</span>
                      </div>
                      <div className="text-xl font-semibold">
                        {currentCityData.humidity}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Wind className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">
                          Wind Speed
                        </span>
                      </div>
                      <div className="text-xl font-semibold">
                        {currentCityData.windSpeed} m/s
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">24h Trend</span>
                      <div className="flex items-center space-x-1">
                        {currentCityData.trend[8] > currentCityData.trend[0] ? (
                          <TrendingUp className="w-4 h-4 text-red-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm font-medium">
                          {Math.abs(
                            currentCityData.trend[8] - currentCityData.trend[0]
                          )}
                        </span>
                      </div>
                    </div>
                    <TrendChart data={currentCityData.trend} color="blue" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LLM Insights */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Insights
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Current Analysis
                  </h4>
                  <p className="text-sm text-blue-800">{llmInsights.summary}</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2">
                    Health Impact
                  </h4>
                  <p className="text-sm text-amber-800">
                    {llmInsights.healthImplication}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Forecast</h4>
                  <p className="text-sm text-green-800">{llmInsights.trend}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* City AQI Map */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Map className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              City AQI Map
            </h3>
          </div>
          <MapView markerData={markerData} onMapClick={handleMapClick} />
        </div>

        {/* Multi-City Comparison */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Multi-City Comparison
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City 1
              </label>
              <select
                value={compareCity1}
                onChange={(e) => setCompareCity1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {Object.keys(mockCityData).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City 2
              </label>
              <select
                value={compareCity2}
                onChange={(e) => setCompareCity2(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {Object.keys(mockCityData).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* City 1 Comparison Box */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">{compareCity1}</h4>
              <div
                className={`p-4 rounded-lg border-2 mb-4 ${getAQIColor(
                  city1Data.aqi
                )}`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {getAQIIcon(city1Data.aqi)}
                  <span className="text-sm font-medium">
                    AQI: {city1Data.aqi}
                  </span>
                </div>
                <div className="text-sm opacity-75">
                  {getAQIStatus(city1Data.aqi)}
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-medium">{city1Data.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Humidity:</span>
                  <span className="font-medium">{city1Data.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wind Speed:</span>
                  <span className="font-medium">{city1Data.windSpeed} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PM2.5:</span>
                  <span className="font-medium">
                    {city1Data.pollutants.pm25} μg/m³
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PM10:</span>
                  <span className="font-medium">
                    {city1Data.pollutants.pm10} μg/m³
                  </span>
                </div>
              </div>
            </div>

            {/* City 2 Comparison Box */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">{compareCity2}</h4>
              <div
                className={`p-4 rounded-lg border-2 mb-4 ${getAQIColor(
                  city2Data.aqi
                )}`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {getAQIIcon(city2Data.aqi)}
                  <span className="text-sm font-medium">
                    AQI: {city2Data.aqi}
                  </span>
                </div>
                <div className="text-sm opacity-75">
                  {getAQIStatus(city2Data.aqi)}
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-medium">{city2Data.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Humidity:</span>
                  <span className="font-medium">{city2Data.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wind Speed:</span>
                  <span className="font-medium">{city2Data.windSpeed} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PM2.5:</span>
                  <span className="font-medium">
                    {city2Data.pollutants.pm25} μg/m³
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PM10:</span>
                  <span className="font-medium">
                    {city2Data.pollutants.pm10} μg/m³
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              AI Comparison Analysis
            </h4>
            <p className="text-sm text-gray-700">
              Comparing {compareCity1} (AQI: {city1Data.aqi}) with{" "}
              {compareCity2} (AQI: {city2Data.aqi}):
              {city1Data.aqi < city2Data.aqi
                ? ` ${compareCity1} shows better air quality primarily due to favorable wind conditions and lower industrial emissions. `
                : ` ${compareCity2} shows better air quality with cleaner atmospheric conditions. `}
              The {Math.abs(city1Data.aqi - city2Data.aqi)} point difference is
              mainly attributed to local weather patterns and pollution sources.
            </p>
          </div>
        </div>

        {/* Data Export Section */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Download className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Export Data
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Download current dashboard data including AQI readings, weather
                conditions, city comparisons, map locations, and AI analysis
                results.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Dashboard Data</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Server className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              System Status
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Database className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Data Pipeline
                </div>
                <div className="text-xs text-gray-600">Operational</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Zap className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  AI Services
                </div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Wifi className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  API Status
                </div>
                <div className="text-xs text-gray-600">99.9% uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
