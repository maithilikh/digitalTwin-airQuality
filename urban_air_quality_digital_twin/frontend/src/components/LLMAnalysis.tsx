import React, { useState, useEffect } from "react";
import {
  Brain,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  LucideIcon,
} from "lucide-react";

interface LLMAnalysisProps {
  type: "forecast" | "pattern" | "scenario";
  title: string;
  icon: LucideIcon;
  context: any;
  auto?: boolean;
  trigger?: number;
}

const LLMAnalysis: React.FC<LLMAnalysisProps> = ({
  type,
  title,
  icon: Icon,
  context,
  auto = true,
  trigger,
}) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generateAnalysis = () => {
    setIsLoading(true);

    setTimeout(() => {
      let analysisText = "";

      switch (type) {
        case "forecast":
          analysisText = `As of 1 December 2025, current meteorological and pollution data suggest the following forecast over the next ${context.timeRange}:

Key insights:
• Cooler winter temperatures and prevailing calm winds — especially in northern plains — are likely to trap pollutants near the surface, raising particulate pollution levels.  
• In coastal or southern cities (especially recently impacted by tropical storms), residual moisture, sea-spray, or recent rains from weather events may temporarily suppress dust but raise humidity and PM₁₀ if roads were flooded or stirred.  
• Emissions from vehicles, ongoing construction, and domestic heating/biomass remain at baseline or slightly elevated levels.  
• Traffic remains typical for weekday/weekend patterns, but with fog or damp conditions in early morning — dispersion may be poor.

**Risk outlook:** For the first 24 hours, expected AQI levels are moderately high ( ‘unhealthy for sensitive groups’ or worse), with **75–85% confidence**. If calm winds persist, the risk of prolonged poor air quality increases — **confidence ~60–65%** for longer forecasts.

Recommendation: People — especially children, elderly, or respiratory-sensitive individuals — should avoid strenuous outdoor activity early morning or at night, and consider masks or air purifiers when indoors.`;
          break;

        case "pattern":
          analysisText = `Historical analysis for ${context.city} indicates typical seasonal behavior for December:

Temporal Patterns:
• Wintertime pollution spikes due to stagnant winds and temperature inversion — especially between 6–10 AM and 6–9 PM (peak traffic + cold stagnation).  
• Coastal and southern cities show occasional dips in PM₂.₅ but spikes in PM₁₀ or dust when storms or cyclonic rains affect drainage and stir up sediments.  
• Over the last few years (post-2023), overall winter PM₂.₅ levels have remained substantially above safe thresholds; many urban cities now record winter averages far exceeding national safe limits. :contentReference[oaicite:2]{index=2}

Notable Trends:
• Sharp rises in pollution in years with major tropical storms (sea-spray + moisture + flooded dust).  
• Persistent smog in northern cities each winter, often punctuated by short-term improvements when winds or light rain arrive.  
• Weekend vs weekday variations still visible, but overshadowed by seasonal baseline pollution.

The data strongly suggest that without structural interventions (vehicular emission control, dust suppression, better waste/biomass-burning regulation), winter pollution spikes will remain a recurring challenge.`;
          break;

        case "scenario":
          const impact = calculateScenarioImpact(context.params);
          analysisText = `Scenario analysis (1 Dec 2025) — projected impact under your input parameters:

Projected Impact:
• Estimated overall AQI improvement: ~${impact.overallImprovement}%  
• Estimated PM2.5 reduction: ~${impact.pm25Reduction}%  
• Estimated relative health-risk reduction: ~${
            impact.healthRisk
          } (on your risk-scale)

Key Findings:
• Reducing traffic by setting traffic controls or car-free zones — especially during morning and evening rush hours — yields the highest benefit.  
• If industrial emissions remain high (>60%), gains from traffic reduction are partially offset by industrial pollution.  
• Weather conditions matter: windy or rainy conditions amplify improvement potential; foggy or still cold conditions drastically reduce it.  
• High population density still concentrates pollutants; green space or urban-planning measures may be needed to reduce localized pollution pockets.

Recommendations:
${generateRecommendations(context.params)}

This scenario underscores how traffic, industry, weather and population density together drive urban air-quality — and how targeted measures (especially traffic + emissions control) remain the most effective way to cut pollution in a typical Indian city.`;
          break;
      }

      setAnalysis(analysisText);
      setLastUpdated(new Date("2025-12-01T09:00:00"));
      setIsLoading(false);
    }, 1200);
  };

  const calculateScenarioImpact = (params: any) => {
    const trafficImpact = (100 - params.traffic) * 0.3;
    const industrialImpact = (100 - params.industrial) * 0.4;
    const weatherImpact = getWeatherMultiplier(params.weather);
    const populationImpact = (100 - params.population) * 0.1;

    const overallImprovement = Math.round(
      (trafficImpact + industrialImpact + populationImpact) * weatherImpact
    );

    return {
      overallImprovement: Math.max(0, Math.min(60, overallImprovement)),
      pm25Reduction: Math.round(overallImprovement * 0.8),
      healthRisk: Math.round(overallImprovement * 1.2),
    };
  };

  const getWeatherMultiplier = (weather: string) => {
    switch (weather) {
      case "windy":
        return 1.3;
      case "rainy":
        return 1.2;
      case "normal":
        return 1.0;
      case "sunny":
        return 0.9;
      case "foggy":
        return 0.7;
      default:
        return 1.0;
    }
  };

  const getWeatherImpact = (weather: string) => {
    switch (weather) {
      case "windy":
        return "highly favorable for pollutant dispersal";
      case "rainy":
        return "beneficial for clearing particulates and dust";
      case "normal":
        return "neutral for air quality";
      case "sunny":
        return "could elevate ground-level ozone formation";
      case "foggy":
        return "likely to trap pollutants, worsening air quality";
      default:
        return "standard for air quality";
    }
  };

  const generateRecommendations = (params: any) => {
    const recommendations = [];

    if (params.traffic > 70) {
      recommendations.push(
        "• Implement congestion pricing or car-free zones to reduce vehicular emissions."
      );
    }
    if (params.industrial > 60) {
      recommendations.push(
        "• Strengthen industrial emission standards and enforce pollution-control norms in factories."
      );
    }
    if (params.weather === "foggy") {
      recommendations.push(
        "• Issue public health advisories during foggy or stagnant-air conditions."
      );
    }
    if (params.population > 80) {
      recommendations.push(
        "• Develop green spaces, increase urban tree cover and promote urban-planning measures to reduce pollution concentration."
      );
    }

    return (
      recommendations.join("\n") ||
      "• Current parameters indicate moderate conditions for air quality — continue monitoring closely."
    );
  };

  useEffect(() => {
    if (auto) {
      generateAnalysis();
    }
  }, [type, context, auto]);

  useEffect(() => {
    if (!auto && typeof trigger === "number") {
      generateAnalysis();
    }
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
            <p className="text-sm text-gray-600">
              AI-powered insights updated for 1 Dec 2025
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <CheckCircle size={16} className="text-green-500" />
              <span>Updated {lastUpdated.toLocaleString()}</span>
            </div>
          )}
          <button
            onClick={generateAnalysis}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <RefreshCw
              size={20}
              className={`text-gray-500 ${isLoading ? "animate-spin" : ""}`}
            />
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
                {analysis.split("\n").map((line, index) => (
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

// import React, { useState, useEffect } from 'react';
// import { Brain, RefreshCw, CheckCircle, AlertCircle, LucideIcon } from 'lucide-react';

// interface LLMAnalysisProps {
//   type: 'forecast' | 'pattern' | 'scenario';
//   title: string;
//   icon: LucideIcon;
//   context: any;
//   auto?: boolean;
//   trigger?: number;
// }

// const LLMAnalysis: React.FC<LLMAnalysisProps> = ({ type, title, icon: Icon, context, auto = true, trigger }) => {
//   const [analysis, setAnalysis] = useState<string>('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

//   const generateAnalysis = () => {
//     setIsLoading(true);

//     // Simulate AI analysis delay
//     setTimeout(() => {
//       let analysisText = '';

//       switch (type) {
//         case 'forecast':
//           analysisText = `Based on current meteorological patterns and historical data, the air quality forecast shows a moderate improvement over the next ${context.timeRange}.

// Key insights:
// • Wind patterns are expected to improve pollutant dispersal by 15-20%
// • Temperature inversion conditions may persist during morning hours
// • Industrial emissions remain at baseline levels
// • Traffic patterns show typical weekday/weekend variations

// Confidence level: 85% for first 24 hours, decreasing to 65% for longer-term predictions.

// Recommendation: Sensitive individuals should limit outdoor activities during early morning hours when air quality is expected to be at its worst.`;
//           break;

//         case 'pattern':
//           analysisText = `Historical analysis reveals significant patterns in ${context.city}'s air quality for ${context.pollutant}:

// Temporal Patterns:
// • Peak pollution typically occurs between 7-9 AM and 5-7 PM (rush hours)
// • Weekend pollution levels are 20-30% lower than weekdays
// • Seasonal variations show higher concentrations in winter months

// Notable Trends:
// • Overall air quality has improved by 12% over the analyzed period
// • Weather-related spikes occurred during 3 major inversion events
// • Industrial emissions show declining trend following new regulations

// Anomalies Detected:
// • Unusual spike on [date] likely due to wildfire activity
// • Consistent improvement following policy implementation in [month]

// The data suggests that traffic reduction measures and industrial regulations are having a positive impact on air quality in ${context.city}.`;
//           break;

//         case 'scenario':
//           const impact = calculateScenarioImpact(context.params);
//           analysisText = `Scenario analysis reveals significant potential for air quality improvement:

// Projected Impact:
// • Overall AQI improvement: ${impact.overallImprovement}%
// • PM2.5 reduction: ${impact.pm25Reduction}%
// • Health risk reduction: ${impact.healthRisk}%

// Key Findings:
// • Traffic reduction of ${context.params.traffic}% would contribute most significantly to improvement
// • Industrial activity at ${context.params.industrial}% shows ${context.params.industrial > 50 ? 'elevated' : 'reduced'} emission levels
// • ${context.params.weather} weather conditions are ${getWeatherImpact(context.params.weather)}
// • Population density adjustment affects localized pollution concentration

// Recommendations:
// ${generateRecommendations(context.params)}

// This scenario demonstrates the interconnected nature of air quality factors and the potential for targeted interventions to create meaningful improvements.`;
//           break;
//       }

//       setAnalysis(analysisText);
//       setLastUpdated(new Date());
//       setIsLoading(false);
//     }, 1500 + Math.random() * 1000);
//   };

//   const calculateScenarioImpact = (params: any) => {
//     const trafficImpact = (100 - params.traffic) * 0.3;
//     const industrialImpact = (100 - params.industrial) * 0.4;
//     const weatherImpact = getWeatherMultiplier(params.weather);
//     const populationImpact = (100 - params.population) * 0.1;

//     const overallImprovement = Math.round((trafficImpact + industrialImpact + populationImpact) * weatherImpact);

//     return {
//       overallImprovement: Math.max(0, Math.min(60, overallImprovement)),
//       pm25Reduction: Math.round(overallImprovement * 0.8),
//       healthRisk: Math.round(overallImprovement * 1.2)
//     };
//   };

//   const getWeatherMultiplier = (weather: string) => {
//     switch (weather) {
//       case 'windy': return 1.3;
//       case 'rainy': return 1.2;
//       case 'normal': return 1.0;
//       case 'sunny': return 0.9;
//       case 'foggy': return 0.7;
//       default: return 1.0;
//     }
//   };

//   const getWeatherImpact = (weather: string) => {
//     switch (weather) {
//       case 'windy': return 'highly favorable for pollutant dispersal';
//       case 'rainy': return 'beneficial for removing particulates';
//       case 'normal': return 'neutral for air quality';
//       case 'sunny': return 'may increase ground-level ozone';
//       case 'foggy': return 'challenging for pollutant dispersal';
//       default: return 'standard for air quality';
//     }
//   };

//   const generateRecommendations = (params: any) => {
//     const recommendations = [];

//     if (params.traffic > 70) {
//       recommendations.push('• Implement congestion pricing or car-free zones');
//     }
//     if (params.industrial > 60) {
//       recommendations.push('• Strengthen industrial emission standards');
//     }
//     if (params.weather === 'foggy') {
//       recommendations.push('• Issue health advisories during foggy conditions');
//     }
//     if (params.population > 80) {
//       recommendations.push('• Develop green spaces to mitigate urban heat island effects');
//     }

//     return recommendations.join('\n') || '• Current parameters show optimal conditions for air quality';
//   };

//   useEffect(() => {
//     if (auto) {
//       generateAnalysis();
//     }
//   }, [type, context, auto]);

//   useEffect(() => {
//     if (!auto && typeof trigger === 'number') {
//       generateAnalysis();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [trigger]);

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center space-x-3">
//           <div className="p-2 bg-purple-100 rounded-lg">
//             <Icon className="text-purple-600" size={24} />
//           </div>
//           <div>
//             <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
//             <p className="text-sm text-gray-600">AI-powered insights and analysis</p>
//           </div>
//         </div>
//         <div className="flex items-center space-x-2">
//           {lastUpdated && (
//             <div className="flex items-center space-x-1 text-sm text-gray-500">
//               <CheckCircle size={16} className="text-green-500" />
//               <span>Updated {lastUpdated.toLocaleTimeString()}</span>
//             </div>
//           )}
//           <button
//             onClick={generateAnalysis}
//             disabled={isLoading}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//           >
//             <RefreshCw size={20} className={`text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
//           </button>
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="flex items-center justify-center py-12">
//           <div className="flex items-center space-x-3">
//             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
//             <span className="text-gray-600">Analyzing data...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="prose max-w-none">
//           <div className="bg-gray-50 rounded-lg p-4">
//             <div className="flex items-start space-x-3">
//               <Brain className="text-purple-500 mt-1" size={20} />
//               <div className="space-y-3">
//                 {analysis.split('\n').map((line, index) => (
//                   <p key={index} className="text-gray-700 leading-relaxed">
//                     {line}
//                   </p>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LLMAnalysis;
