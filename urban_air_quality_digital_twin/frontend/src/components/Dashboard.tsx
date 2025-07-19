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
import apiService from "../services/api";

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

interface CityData {
  aqi: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pollutants: Record<string, number>;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const location = useLocation();
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [currentCityData, setCurrentCityData] = useState<CityData | null>(null);
  const [cityTrend, setCityTrend] = useState<number[]>([]);
  const [cityForecast, setCityForecast] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markerData, setMarkerData] = useState<MapData | null>(null);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load cities on component mount
  useEffect(() => {
    loadCities();
  }, []);

  // Load city data when selected city changes
  useEffect(() => {
    if (selectedCity) {
      loadCityData(selectedCity);
    }
  }, [selectedCity]);

  const loadCities = async () => {
    try {
      const response = await apiService.getCities();
      if (response.error) {
        setError(response.error);
        return;
      }
      if (response.data) {
        setCities(response.data);
        if (response.data.length > 0) {
          setSelectedCity(response.data[0]);
        }
      }
    } catch (err) {
      setError("Failed to load cities");
    }
  };

  const loadCityData = async (city: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Load current data
      const currentResponse = await apiService.getCurrentCityData(city);
      if (currentResponse.error) {
        setError(currentResponse.error);
        return;
      }
      if (currentResponse.data) {
        setCurrentCityData(currentResponse.data);
      }

      // Load trend data
      const trendResponse = await apiService.getCityTrend(city);
      if (trendResponse.data) {
        setCityTrend(trendResponse.data.trend);
      }

      // Load forecast data
      const forecastResponse = await apiService.getCityForecast(city);
      if (forecastResponse.data) {
        setCityForecast(forecastResponse.data.forecast);
      }
    } catch (err) {
      setError("Failed to load city data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for map click
  const handleMapClick = async (lat: number, lng: number) => {
    setMarkerData(null);
    try {
      const response = await apiService.getMapLocations();
      if (response.data) {
        const location = response.data.find(
          (loc) =>
            Math.abs(loc.lat - lat) < 0.1 && Math.abs(loc.lng - lng) < 0.1
        );
        if (location) {
          setMarkerData({
            lat: location.lat,
            lng: location.lng,
            city: location.city,
            aqi: location.aqi,
            weather: location.weather,
            category: location.category as any,
          });
        }
      }
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
    try {
      const response = await apiService.queryLLM(aiQuery);
      if (response.error) {
        setAiResponse(`Error: ${response.error}`);
      } else if (response.data) {
        setAiResponse(response.data.response);
      }
    } catch (err) {
      setAiResponse("Failed to get AI response. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await apiService.exportDashboard();
      if (response.data) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `air-quality-data-${
          new Date().toISOString().split("T")[0]
        }.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  if (isLoading && !currentCityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading air quality data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <XCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadCities()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            <nav className="hidden md:flex space-x-8">
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
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ask the AI */}
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
        {currentCityData && (
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
                          <span className="text-sm text-gray-600">
                            Humidity
                          </span>
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
                          {cityTrend.length > 0 &&
                          cityTrend[cityTrend.length - 1] > cityTrend[0] ? (
                            <TrendingUp className="w-4 h-4 text-red-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      <TrendChart data={cityTrend} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Map */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Map className="w-5 h-5 text-blue-600" />
                  <span>Map View</span>
                </h3>
                <MapView markerData={markerData} onMapClick={handleMapClick} />
              </div>

              {/* System Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Server className="w-5 h-5 text-green-600" />
                  <span>System Status</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data Pipeline</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">
                        Operational
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI Services</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Uptime</span>
                    <span className="text-sm font-medium text-gray-900">
                      99.9%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Button */}
        <div className="flex justify-end">
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
