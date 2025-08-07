import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, CheckCircle, AlertCircle, LucideIcon } from 'lucide-react';

interface LLMAnalysisProps {
  type: 'forecast' | 'pattern' | 'scenario';
  title: string;
  icon: LucideIcon;
  context: any;
  auto?: boolean;
  trigger?: number;
}

const LLMAnalysis: React.FC<LLMAnalysisProps> = ({ type, title, icon: Icon, context, auto = true, trigger }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generateAnalysis = () => {
    setIsLoading(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      let analysisText = '';
      
      switch (type) {
        case 'forecast':
          analysisText = `Based on current meteorological patterns and historical data, the air quality forecast shows a moderate improvement over the next ${context.timeRange}. 

Key insights:
• Wind patterns are expected to improve pollutant dispersal by 15-20%
• Temperature inversion conditions may persist during morning hours
• Industrial emissions remain at baseline levels
• Traffic patterns show typical weekday/weekend variations

Confidence level: 85% for first 24 hours, decreasing to 65% for longer-term predictions.

Recommendation: Sensitive individuals should limit outdoor activities during early morning hours when air quality is expected to be at its worst.`;
          break;
          
        case 'pattern':
          analysisText = `Historical analysis reveals significant patterns in ${context.city}'s air quality for ${context.pollutant}:

Temporal Patterns:
• Peak pollution typically occurs between 7-9 AM and 5-7 PM (rush hours)
• Weekend pollution levels are 20-30% lower than weekdays
• Seasonal variations show higher concentrations in winter months

Notable Trends:
• Overall air quality has improved by 12% over the analyzed period
• Weather-related spikes occurred during 3 major inversion events
• Industrial emissions show declining trend following new regulations

Anomalies Detected:
• Unusual spike on [date] likely due to wildfire activity
• Consistent improvement following policy implementation in [month]

The data suggests that traffic reduction measures and industrial regulations are having a positive impact on air quality in ${context.city}.`;
          break;
          
        case 'scenario':
          const impact = calculateScenarioImpact(context.params);
          analysisText = `Scenario analysis reveals significant potential for air quality improvement:

Projected Impact:
• Overall AQI improvement: ${impact.overallImprovement}%
• PM2.5 reduction: ${impact.pm25Reduction}%
• Health risk reduction: ${impact.healthRisk}%

Key Findings:
• Traffic reduction of ${context.params.traffic}% would contribute most significantly to improvement
• Industrial activity at ${context.params.industrial}% shows ${context.params.industrial > 50 ? 'elevated' : 'reduced'} emission levels
• ${context.params.weather} weather conditions are ${getWeatherImpact(context.params.weather)}
• Population density adjustment affects localized pollution concentration

Recommendations:
${generateRecommendations(context.params)}

This scenario demonstrates the interconnected nature of air quality factors and the potential for targeted interventions to create meaningful improvements.`;
          break;
      }
      
      setAnalysis(analysisText);
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1500 + Math.random() * 1000);
  };

  const calculateScenarioImpact = (params: any) => {
    const trafficImpact = (100 - params.traffic) * 0.3;
    const industrialImpact = (100 - params.industrial) * 0.4;
    const weatherImpact = getWeatherMultiplier(params.weather);
    const populationImpact = (100 - params.population) * 0.1;
    
    const overallImprovement = Math.round((trafficImpact + industrialImpact + populationImpact) * weatherImpact);
    
    return {
      overallImprovement: Math.max(0, Math.min(60, overallImprovement)),
      pm25Reduction: Math.round(overallImprovement * 0.8),
      healthRisk: Math.round(overallImprovement * 1.2)
    };
  };

  const getWeatherMultiplier = (weather: string) => {
    switch (weather) {
      case 'windy': return 1.3;
      case 'rainy': return 1.2;
      case 'normal': return 1.0;
      case 'sunny': return 0.9;
      case 'foggy': return 0.7;
      default: return 1.0;
    }
  };

  const getWeatherImpact = (weather: string) => {
    switch (weather) {
      case 'windy': return 'highly favorable for pollutant dispersal';
      case 'rainy': return 'beneficial for removing particulates';
      case 'normal': return 'neutral for air quality';
      case 'sunny': return 'may increase ground-level ozone';
      case 'foggy': return 'challenging for pollutant dispersal';
      default: return 'standard for air quality';
    }
  };

  const generateRecommendations = (params: any) => {
    const recommendations = [];
    
    if (params.traffic > 70) {
      recommendations.push('• Implement congestion pricing or car-free zones');
    }
    if (params.industrial > 60) {
      recommendations.push('• Strengthen industrial emission standards');
    }
    if (params.weather === 'foggy') {
      recommendations.push('• Issue health advisories during foggy conditions');
    }
    if (params.population > 80) {
      recommendations.push('• Develop green spaces to mitigate urban heat island effects');
    }
    
    return recommendations.join('\n') || '• Current parameters show optimal conditions for air quality';
  };

  useEffect(() => {
    if (auto) {
      generateAnalysis();
    }
  }, [type, context, auto]);

  useEffect(() => {
    if (!auto && typeof trigger === 'number') {
      generateAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Icon className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">AI-powered insights and analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <CheckCircle size={16} className="text-green-500" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
          <button
            onClick={generateAnalysis}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <RefreshCw size={20} className={`text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <span className="text-gray-600">Analyzing data...</span>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Brain className="text-purple-500 mt-1" size={20} />
              <div className="space-y-3">
                {analysis.split('\n').map((line, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMAnalysis;