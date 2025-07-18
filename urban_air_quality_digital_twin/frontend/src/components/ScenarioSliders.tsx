import React, { useState } from 'react';
import { Car, Factory, Cloud, Users, Play } from 'lucide-react';

interface ScenarioParams {
  traffic: number;
  industrial: number;
  weather: string;
  population: number;
}

interface ScenarioSlidersProps {
  params: ScenarioParams;
  onChange: (params: ScenarioParams) => void;
  onAnalyze?: () => void;
}

const ScenarioSliders: React.FC<ScenarioSlidersProps> = ({ params, onChange, onAnalyze }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSliderChange = (key: keyof ScenarioParams, value: number | string) => {
    const newParams = { ...params, [key]: value };
    onChange(newParams);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    if (onAnalyze) onAnalyze();
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  const weatherOptions = [
    { value: 'sunny', label: 'Sunny', description: 'Clear skies, low humidity' },
    { value: 'normal', label: 'Normal', description: 'Typical weather conditions' },
    { value: 'rainy', label: 'Rainy', description: 'Precipitation, high humidity' },
    { value: 'windy', label: 'Windy', description: 'Strong winds, good dispersal' },
    { value: 'foggy', label: 'Foggy', description: 'Low visibility, poor dispersal' }
  ];

  const getSliderColor = (value: number) => {
    if (value <= 30) return 'bg-green-500';
    if (value <= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSliderTrackColor = (value: number) => {
    if (value <= 30) return 'bg-green-100';
    if (value <= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-8">
      {/* Traffic Reduction */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Car className="text-blue-500" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900">Traffic Reduction</h3>
            <p className="text-sm text-gray-600">Reduce vehicle emissions by {params.traffic}%</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>No reduction</span>
            <span className="font-medium">{params.traffic}%</span>
            <span>Maximum reduction</span>
          </div>
          <div className="relative">
            <div className={`h-2 rounded-full ${getSliderTrackColor(params.traffic)}`}>
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getSliderColor(params.traffic)}`}
                style={{ width: `${params.traffic}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.traffic}
              onChange={(e) => handleSliderChange('traffic', parseInt(e.target.value))}
              className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Industrial Activity */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Factory className="text-orange-500" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900">Industrial Activity</h3>
            <p className="text-sm text-gray-600">Adjust industrial emissions to {params.industrial}%</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Minimal</span>
            <span className="font-medium">{params.industrial}%</span>
            <span>Maximum</span>
          </div>
          <div className="relative">
            <div className={`h-2 rounded-full ${getSliderTrackColor(params.industrial)}`}>
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getSliderColor(params.industrial)}`}
                style={{ width: `${params.industrial}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.industrial}
              onChange={(e) => handleSliderChange('industrial', parseInt(e.target.value))}
              className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Population Density */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Users className="text-purple-500" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900">Population Density</h3>
            <p className="text-sm text-gray-600">Adjust population density to {params.population}%</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Low density</span>
            <span className="font-medium">{params.population}%</span>
            <span>High density</span>
          </div>
          <div className="relative">
            <div className={`h-2 rounded-full ${getSliderTrackColor(params.population)}`}>
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getSliderColor(params.population)}`}
                style={{ width: `${params.population}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.population}
              onChange={(e) => handleSliderChange('population', parseInt(e.target.value))}
              className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Weather Conditions */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Cloud className="text-blue-500" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900">Weather Conditions</h3>
            <p className="text-sm text-gray-600">Select weather pattern</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {weatherOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSliderChange('weather', option.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                params.weather === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      <div className="pt-4">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Analyzing Scenario...</span>
            </>
          ) : (
            <>
              <Play size={20} />
              <span>Analyze Scenario</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ScenarioSliders;