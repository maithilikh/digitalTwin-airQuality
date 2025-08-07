import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from 'react';
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
  Map
} from 'lucide-react';
import MapView, { MapData } from './MapView';

// Mock data - in production, this would come from your API
const mockCityData = {
  'New York': {
    aqi: 76,
    temperature: 22,
    humidity: 65,
    windSpeed: 8.5,
    trend: [68, 71, 74, 76, 78, 75, 76, 73, 76],
    forecast: [76, 78, 81, 84, 79, 75, 72],
    pollutants: { pm25: 18, pm10: 45, o3: 89, no2: 34, so2: 12, co: 0.8 }
  },
  'Los Angeles': {
    aqi: 134,
    temperature: 28,
    humidity: 58,
    windSpeed: 6.2,
    trend: [128, 132, 136, 134, 138, 142, 134, 131, 134],
    forecast: [134, 136, 139, 142, 138, 132, 129],
    pollutants: { pm25: 45, pm10: 78, o3: 134, no2: 56, so2: 18, co: 1.2 }
  },
  'Chicago': {
    aqi: 58,
    temperature: 18,
    humidity: 72,
    windSpeed: 12.3,
    trend: [62, 59, 56, 58, 60, 57, 58, 55, 58],
    forecast: [58, 60, 63, 66, 61, 57, 54],
    pollutants: { pm25: 12, pm10: 28, o3: 58, no2: 24, so2: 8, co: 0.5 }
  },
  'Miami': {
    aqi: 42,
    temperature: 31,
    humidity: 78,
    windSpeed: 15.1,
    trend: [38, 41, 44, 42, 45, 43, 42, 39, 42],
    forecast: [42, 44, 47, 50, 45, 41, 38],
    pollutants: { pm25: 8, pm10: 18, o3: 42, no2: 16, so2: 4, co: 0.3 }
  },
  'Seattle': {
    aqi: 35,
    temperature: 16,
    humidity: 82,
    windSpeed: 9.8,
    trend: [32, 35, 38, 35, 37, 34, 35, 33, 35],
    forecast: [35, 37, 40, 43, 38, 34, 31],
    pollutants: { pm25: 6, pm10: 15, o3: 35, no2: 18, so2: 5, co: 0.4 }
  },
  'Denver': {
    aqi: 89,
    temperature: 20,
    humidity: 45,
    windSpeed: 11.2,
    trend: [85, 88, 91, 89, 92, 87, 89, 86, 89],
    forecast: [89, 91, 94, 97, 92, 88, 85],
    pollutants: { pm25: 22, pm10: 52, o3: 89, no2: 38, so2: 14, co: 0.9 }
  }
};

const cityCoords: Record<string, { lat: number; lng: number }> = {
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Denver': { lat: 39.7392, lng: -104.9903 }
};

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return 'text-green-500 bg-green-50 border-green-200';
  if (aqi <= 100) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
  if (aqi <= 150) return 'text-orange-500 bg-orange-50 border-orange-200';
  if (aqi <= 200) return 'text-red-500 bg-red-50 border-red-200';
  if (aqi <= 300) return 'text-purple-500 bg-purple-50 border-purple-200';
  return 'text-red-800 bg-red-100 border-red-300';
};

const getAQIStatus = (aqi: number) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

const getAQIIcon = (aqi: number) => {
  if (aqi <= 50) return <CheckCircle className="w-5 h-5" />;
  if (aqi <= 100) return <Eye className="w-5 h-5" />;
  if (aqi <= 150) return <AlertTriangle className="w-5 h-5" />;
  return <XCircle className="w-5 h-5" />;
};

const TrendChart = ({ data, color = 'blue' }: { data: number[], color?: string }) => {
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
  const [selectedCity, setSelectedCity] = useState('New York');
  const [compareCity1, setCompareCity1] = useState('New York');
  const [compareCity2, setCompareCity2] = useState('Los Angeles');
  const [markerData, setMarkerData] = useState<MapData | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentCityData, setCurrentCityData] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentCityData1 = mockCityData[selectedCity as keyof typeof mockCityData];
  const city1Data = mockCityData[compareCity1 as keyof typeof mockCityData];
  const city2Data = mockCityData[compareCity2 as keyof typeof mockCityData];

  // Handler for map click
  const handleMapClick = async (lat: number, lng: number) => {
    setMarkerData(null); // Clear previous marker while loading
    try {
      const res = await fetch(`/api/get-city-data?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error('Failed to fetch city data');
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
        city: 'Unknown',
        aqi: 0,
        weather: 'Unknown',
        category: 'Good',
      });
    }
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    setAiResponse('');
    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiQuery })
      });
      const data = await res.json();
      // The backend returns { response: ... }
      setAiResponse(
        typeof data.response === 'string'
          ? data.response
          : data.response.text || JSON.stringify(data.response)
      );
    } catch (err) {
      setAiResponse('Sorry, there was an error contacting the AI service.');
    }
    setIsAiLoading(false);
  };

  const handleExportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      selectedCity,
      currentData: currentCityData1,
      comparison: { city1: compareCity1, city2: compareCity2, data1: city1Data, data2: city2Data },
      mapLocation: markerData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `air-quality-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const llmInsights = {
    summary: "Air quality is currently moderate with PM2.5 levels elevated due to increased traffic and stagnant weather conditions. Wind patterns suggest improvement over the next 6 hours.",
    healthImplication: "Sensitive individuals should limit outdoor activities. Consider wearing a mask during peak traffic hours (7-9 AM, 5-7 PM).",
    recommendations: [
      "Keep windows closed during peak pollution hours",
      "Use air purifiers indoors",
      "Avoid outdoor exercise before 10 AM",
      "Stay hydrated to help your body process pollutants"
    ],
    trend: "Pollution levels are expected to decrease by 15% over the next 24 hours due to incoming wind patterns."
  };

  useEffect(() => {
    async function fetchCityData() {
      setCurrentCityData(null); // Optional: show loading state
      const coords = cityCoords[selectedCity];
      if (!coords) return;
      const res = await fetch(`/api/get-city-data?lat=${coords.lat}&lng=${coords.lng}`);
      const data = await res.json();
      setCurrentCityData(data);
    }
    fetchCityData();
  }, [selectedCity]);

  // Before your main return statement, add:
  if (!currentCityData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading current city data...</span>
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
              <h1 className="text-xl font-bold text-gray-900">AirQuality Monitor</h1>
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
      location.pathname === '/' ? 'text-blue-600 font-medium border-b-2 border-blue-600 pb-2' : 'text-gray-600 hover:text-gray-900'
    } transition-colors`}
  >
    Dashboard
  </Link>
  <Link
    to="/analysis"
    className={`${
      location.pathname === '/analysis' ? 'text-blue-600 font-medium border-b-2 border-blue-600 pb-2' : 'text-gray-600 hover:text-gray-900'
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
            <h2 className="text-2xl font-bold text-gray-900">Current Location</h2>
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
              {Object.keys(mockCityData).map(city => (
                <option key={city} value={city}>{city}</option>
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
                onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
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
                <span>{isAiLoading ? 'Analyzing...' : 'Ask AI'}</span>
              </button>
            </div>
            
            {aiResponse && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">AI Response:</h4>
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
                  <div className={`p-4 rounded-xl border-2 ${getAQIColor(currentCityData.aqi)}`}>
                    <div className="flex items-center space-x-3 mb-2">
                      {getAQIIcon(currentCityData.aqi)}
                      <span className="text-sm font-medium">Air Quality Index</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{currentCityData.aqi}</div>
                    <div className="text-sm opacity-75">{getAQIStatus(currentCityData.aqi)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600">Temperature</span>
                      </div>
                      <div className="text-xl font-semibold">{currentCityData.temp}°C</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Humidity</span>
                      </div>
                      <div className="text-xl font-semibold">{currentCityData.wind}%</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Wind className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Wind Speed</span>
                      </div>
                      <div className="text-xl font-semibold">{currentCityData.wind} m/s</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">24h Trend</span>
                      <div className="flex items-center space-x-1">
                       
                        <span className="text-sm font-medium">
                         
                        </span>
                      </div>
                    </div>
                    
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
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Current Analysis</h4>
                  <p className="text-sm text-blue-800">{llmInsights.summary}</p>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2">Health Impact</h4>
                  <p className="text-sm text-amber-800">{llmInsights.healthImplication}</p>
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
            <h3 className="text-lg font-semibold text-gray-900">City AQI Map</h3>
          </div>
          <MapView markerData={markerData} onMapClick={handleMapClick} />
        </div>

        {/* Multi-City Comparison */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Multi-City Comparison</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City 1</label>
              <select
                value={compareCity1}
                onChange={(e) => setCompareCity1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {Object.keys(mockCityData).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City 2</label>
              <select
                value={compareCity2}
                onChange={(e) => setCompareCity2(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {Object.keys(mockCityData).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* City 1 Comparison Box */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">{compareCity1}</h4>
              <div className={`p-4 rounded-lg border-2 mb-4 ${getAQIColor(city1Data.aqi)}`}>
                <div className="flex items-center space-x-2 mb-2">
                  {getAQIIcon(city1Data.aqi)}
                  <span className="text-sm font-medium">AQI: {city1Data.aqi}</span>
                </div>
                <div className="text-sm opacity-75">{getAQIStatus(city1Data.aqi)}</div>
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
                  <span className="font-medium">{city1Data.pollutants.pm25} μg/m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PM10:</span>
                  <span className="font-medium">{city1Data.pollutants.pm10} μg/m³</span>
                </div>
              </div>
            </div>

            {/* City 2 Comparison Box */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">{compareCity2}</h4>
              <div className={`p-4 rounded-lg border-2 mb-4 ${getAQIColor(city2Data.aqi)}`}>
                <div className="flex items-center space-x-2 mb-2">
                  {getAQIIcon(city2Data.aqi)}
                  <span className="text-sm font-medium">AQI: {city2Data.aqi}</span>
                </div>
                <div className="text-sm opacity-75">{getAQIStatus(city2Data.aqi)}</div>
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
                  <span className="font-medium">{city2Data.pollutants.pm25} μg/m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PM10:</span>
                  <span className="font-medium">{city2Data.pollutants.pm10} μg/m³</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">AI Comparison Analysis</h4>
            <p className="text-sm text-gray-700">
              Comparing {compareCity1} (AQI: {city1Data.aqi}) with {compareCity2} (AQI: {city2Data.aqi}): 
              {city1Data.aqi < city2Data.aqi 
                ? ` ${compareCity1} shows better air quality primarily due to favorable wind conditions and lower industrial emissions. `
                : ` ${compareCity2} shows better air quality with cleaner atmospheric conditions. `
              }
              The {Math.abs(city1Data.aqi - city2Data.aqi)} point difference is mainly attributed to local weather patterns and pollution sources.
            </p>
          </div>
        </div>

        {/* Data Export Section */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Download className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
              </div>
              <p className="text-sm text-gray-600">
                Download current dashboard data including AQI readings, weather conditions, 
                city comparisons, map locations, and AI analysis results.
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
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Database className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Data Pipeline</div>
                <div className="text-xs text-gray-600">Operational</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Zap className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">AI Services</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Wifi className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">API Status</div>
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