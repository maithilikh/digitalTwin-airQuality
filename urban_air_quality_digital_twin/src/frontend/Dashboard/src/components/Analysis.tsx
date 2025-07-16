import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Brain, Settings, Calendar, MapPin, Wind, Users, Factory, Car, Cloud, AlertCircle } from 'lucide-react';
import ForecastChart from './ForecastChart';
import HistoricalChart from './HistoricalChart';
import ScenarioSliders from './ScenarioSliders';
import LLMAnalysis from './LLMAnalysis';
import { mockForecastData, mockHistoricalData } from '../Analysis/mockData';

type AnalysisTab = 'forecast' | 'historical' | 'scenario';

const Analysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('forecast');
  const [forecastTimeRange, setForecastTimeRange] = useState('24h');
  const [historicalDateRange, setHistoricalDateRange] = useState('7d');
  const [selectedCity, setSelectedCity] = useState('New York');
  const [selectedPollutant, setSelectedPollutant] = useState('pm25');
  const [isLoading, setIsLoading] = useState(false);
  
  const [scenarioParams, setScenarioParams] = useState({
    traffic: 50,
    industrial: 50,
    weather: 'normal',
    population: 50
  });
  const [analyzedScenarioParams, setAnalyzedScenarioParams] = useState(scenarioParams);
  const [scenarioAnalysisTrigger, setScenarioAnalysisTrigger] = useState(0);

  const handleTabChange = (tab: AnalysisTab) => {
    setActiveTab(tab);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleScenarioChange = (params: typeof scenarioParams) => {
    setScenarioParams(params);
  };
  const handleAnalyzeScenario = () => {
    setAnalyzedScenarioParams(scenarioParams);
    setScenarioAnalysisTrigger(t => t + 1);
  };

  const tabs = [
    { id: 'forecast', label: 'Forecast & Predictions', icon: TrendingUp },
    { id: 'historical', label: 'Historical Analysis', icon: Activity },
    { id: 'scenario', label: 'Scenario Analysis', icon: Settings }
  ];

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '48h', label: '48 Hours' },
    { value: '7d', label: '7 Days' }
  ];

  const historicalRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' }
  ];

  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  const pollutants = [
    { value: 'pm25', label: 'PM2.5' },
    { value: 'pm10', label: 'PM10' },
    { value: 'o3', label: 'Ozone' },
    { value: 'no2', label: 'NO₂' },
    { value: 'so2', label: 'SO₂' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Air Quality Analysis</h1>
          <p className="text-gray-600">Deep dive into air quality data with AI-powered insights</p>
        </div>
        <Link to="/">
    <button className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
      Back to Dashboard
    </button>
  </Link>
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as AnalysisTab)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-gray-600">Loading analysis...</span>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <div className="space-y-8">
            {/* Forecast Tab */}
            {activeTab === 'forecast' && (
              <div className="space-y-8">
                {/* Controls */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar size={20} className="text-gray-500" />
                      <span className="font-medium text-gray-700">Time Range:</span>
                    </div>
                    <select
                      value={forecastTimeRange}
                      onChange={(e) => setForecastTimeRange(e.target.value)}
                      className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {timeRanges.map(range => (
                        <option key={range.value} value={range.value}>{range.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Forecast Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Air Quality Forecast</h2>
                    <p className="text-gray-600">Predicted AQI values with confidence intervals</p>
                  </div>
                  <ForecastChart data={mockForecastData} timeRange={forecastTimeRange} />
                </div>

                {/* LLM Forecast Analysis */}
                <LLMAnalysis 
                  type="forecast"
                  title="AI Forecast Analysis"
                  icon={Brain}
                  context={{ timeRange: forecastTimeRange }}
                />
              </div>
            )}

            {/* Historical Tab */}
            {activeTab === 'historical' && (
              <div className="space-y-8">
                {/* Controls */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar size={20} className="text-gray-500" />
                      <select
                        value={historicalDateRange}
                        onChange={(e) => setHistoricalDateRange(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {historicalRanges.map(range => (
                          <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={20} className="text-gray-500" />
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wind size={20} className="text-gray-500" />
                      <select
                        value={selectedPollutant}
                        onChange={(e) => setSelectedPollutant(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {pollutants.map(pollutant => (
                          <option key={pollutant.value} value={pollutant.value}>{pollutant.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Historical Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Historical Trends</h2>
                    <p className="text-gray-600">Long-term air quality patterns and trends</p>
                  </div>
                  <HistoricalChart 
                    data={mockHistoricalData} 
                    city={selectedCity}
                    pollutant={selectedPollutant}
                    dateRange={historicalDateRange}
                  />
                </div>

                {/* LLM Pattern Analysis */}
                <LLMAnalysis 
                  type="pattern"
                  title="AI Pattern Analysis"
                  icon={Brain}
                  context={{ city: selectedCity, pollutant: selectedPollutant, dateRange: historicalDateRange }}
                />
              </div>
            )}

            {/* Scenario Tab */}
            {activeTab === 'scenario' && (
              <div className="space-y-8">
                {/* Scenario Controls */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Scenario Analysis</h2>
                    <p className="text-gray-600">Adjust parameters to see how they affect air quality</p>
                  </div>
                  <ScenarioSliders 
                    params={scenarioParams}
                    onChange={handleScenarioChange}
                    onAnalyze={handleAnalyzeScenario}
                  />
                </div>
                {/* Scenario Results */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Scenario Impact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Car size={20} className="text-blue-500" />
                          <span className="font-medium text-blue-900">Traffic</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">{analyzedScenarioParams.traffic}%</p>
                        <p className="text-sm text-blue-600">of normal levels</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Factory size={20} className="text-orange-500" />
                          <span className="font-medium text-orange-900">Industrial</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-900">{analyzedScenarioParams.industrial}%</p>
                        <p className="text-sm text-orange-600">of normal activity</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Cloud size={20} className="text-green-500" />
                          <span className="font-medium text-green-900">Weather</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900 capitalize">{analyzedScenarioParams.weather}</p>
                        <p className="text-sm text-green-600">conditions</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users size={20} className="text-purple-500" />
                          <span className="font-medium text-purple-900">Population</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900">{analyzedScenarioParams.population}%</p>
                        <p className="text-sm text-purple-600">density</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* LLM Scenario Analysis */}
                <LLMAnalysis 
                  type="scenario"
                  title="AI Scenario Analysis"
                  icon={Brain}
                  context={{ params: analyzedScenarioParams }}
                  auto={false}
                  trigger={scenarioAnalysisTrigger}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;