import React, { useState, useEffect } from "react";
import {
  Brain,
  RefreshCw,
  CheckCircle,
  LucideIcon,
} from "lucide-react";

interface LLMAnalysisProps {
  type: "forecast" | "pattern" | "scenario";
  title: string;
  icon: LucideIcon;
  context: any;   // will contain params + city for scenario
  auto?: boolean;
  trigger?: number;
}

// Rough city profiles based on typical AQI, density, green cover & sources.
// These are heuristic but grounded in observed patterns in each city.
const CITY_PROFILES: Record<
  string,
  {
    baselineAQI: number;          // typical winter-ish AQI
    trafficWeight: number;        // importance of traffic in pollution mix
    industrialWeight: number;     // importance of industry
    populationWeight: number;     // density / local exposure
    baseCap: number;              // max % improvement we allow in UI
    healthMultiplier: number;     // how strongly health risk changes per % improvement
    greenCoverIndex: number;      // 0–1, more means more trees / parks
    description: string;
  }
> = {
  Mumbai: {
    // Coastal, sea breeze helps but recent years show more poor/very poor days
    baselineAQI: 180,
    trafficWeight: 0.30,
    industrialWeight: 0.30,
    populationWeight: 0.20,
    baseCap: 55,
    healthMultiplier: 1.1,
    greenCoverIndex: 0.18,
    description:
      "Coastal megacity where sea breeze can help, but traffic, construction and high humidity now drive more haze events.",
  },
  Delhi: {
    // Extremely high winter AQI; multiple sources including traffic, industry, biomass, stubble burning
    baselineAQI: 320,
    trafficWeight: 0.35,
    industrialWeight: 0.35,
    populationWeight: 0.20,
    baseCap: 50,
    healthMultiplier: 1.4,
    greenCoverIndex: 0.10,
    description:
      "Landlocked megacity with frequent winter smog episodes driven by traffic, industry, biomass burning and regional sources.",
  },
  Bengaluru: {
    // Often 'moderate' but trending worse; traffic + construction + road dust; losing green cover
    baselineAQI: 160,
    trafficWeight: 0.35,
    industrialWeight: 0.20,
    populationWeight: 0.25,
    baseCap: 45,
    healthMultiplier: 1.1,
    greenCoverIndex: 0.22,
    description:
      "Tech hub with historically better climate but rising traffic, dust and loss of tree cover pushing particulate levels upward.",
  },
  Chennai: {
    // Typically moderate AQI; coastal & monsoon rains help; traffic, road dust & industry still important
    baselineAQI: 150,
    trafficWeight: 0.32,
    industrialWeight: 0.25,
    populationWeight: 0.23,
    baseCap: 45,
    healthMultiplier: 1.1,
    greenCoverIndex: 0.20,
    description:
      "Coastal city where sea breeze and monsoon rains can clean the air, but traffic, road dust and industrial clusters keep PM elevated.",
  },
  Kolkata: {
    // Dense, busy, chronic pollution from diesel vehicles, industry, waste burning & construction
    baselineAQI: 230,
    trafficWeight: 0.35,
    industrialWeight: 0.30,
    populationWeight: 0.25,
    baseCap: 50,
    healthMultiplier: 1.3,
    greenCoverIndex: 0.14,
    description:
      "Dense riverine megacity with high dependence on diesel vehicles, industry, waste burning and construction dust.",
  },
};

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
      const city: string = (context && context.city) || "Mumbai";

      switch (type) {
        case "forecast":
          analysisText = `As of 1 December 2025, current meteorological and pollution data suggest the following forecast over the next ${
            context.timeRange
          }:

Key insights:
• Cooler winter temperatures and prevailing calm winds — especially in northern plains — are likely to trap pollutants near the surface, raising particulate pollution levels.  
• In coastal or southern cities (especially recently impacted by tropical storms), residual moisture, sea-spray, or recent rains from weather events may temporarily suppress dust but raise humidity and PM₁₀ if roads were flooded or stirred.  
• Emissions from vehicles, ongoing construction, and domestic heating/biomass remain at baseline or slightly elevated levels.  
• Traffic remains typical for weekday/weekend patterns, but with fog or damp conditions in early morning — dispersion may be poor.

Risk outlook: For the first 24 hours, expected AQI levels are moderately high (‘unhealthy for sensitive groups’ or worse), with 75–85% confidence. If calm winds persist, the risk of prolonged poor air quality increases — confidence ~60–65% for longer forecasts.

Recommendation: People — especially children, elderly, or respiratory-sensitive individuals — should avoid strenuous outdoor activity early morning or at night, and consider masks or air purifiers when indoors.`;
          break;

        case "pattern":
          analysisText = `Historical analysis for ${
            context.city || "the selected city"
          } indicates typical seasonal behavior for December:

Temporal patterns:
• Wintertime pollution spikes due to stagnant winds and temperature inversion — especially between 6–10 AM and 6–9 PM (peak traffic + cold stagnation).  
• Coastal and southern cities show occasional dips in PM₂.₅ but spikes in PM₁₀ or dust when storms or cyclonic rains affect drainage and stir up sediments.  
• Over the last few years (post-2023), overall winter PM₂.₅ levels have remained substantially above safe thresholds; many urban cities now record winter averages far exceeding national safe limits.

Notable trends:
• Sharp rises in pollution in years with major tropical storms or prolonged dry spells.  
• Persistent smog in northern cities each winter, often punctuated by short-term improvements when winds or light rain arrive.  
• Weekend vs weekday variations still visible, but overshadowed by seasonal baseline pollution.

The data strongly suggest that without structural interventions (vehicular emission control, dust suppression, better waste/biomass-burning regulation), winter pollution spikes will remain a recurring challenge.`;
          break;

        case "scenario": {
          const params = context.params || {};
          const impact = calculateScenarioImpact(city, params);
          analysisText = generateCitySpecificNarrative(city, params, impact);
          break;
        }
      }

      setAnalysis(analysisText);
      setLastUpdated(new Date("2025-12-01T09:00:00"));
      setIsLoading(false);
    }, 1200);
  };

  // ---------- Scenario helpers ----------

  const getWeatherMultiplier = (weather: string) => {
    switch (weather) {
      case "windy":
        return 1.3; // windy boosts benefit
      case "rainy":
        return 1.2; // rain helps wash out particulates
      case "normal":
        return 1.0;
      case "sunny":
        return 0.9; // can worsen ozone, so benefit slightly muted
      case "foggy":
        return 0.7; // fog traps pollutants, benefit reduced
      default:
        return 1.0;
    }
  };

  const getWeatherImpact = (weather: string) => {
    switch (weather) {
      case "windy":
        return "highly favorable for pollutant dispersal";
      case "rainy":
        return "beneficial for clearing particulates and road dust";
      case "normal":
        return "neutral for air quality";
      case "sunny":
        return "could elevate ground-level ozone formation in busy corridors";
      case "foggy":
        return "likely to trap pollutants near the surface, worsening smog";
      default:
        return "standard for air quality";
    }
  };

  const calculateScenarioImpact = (city: string, params: any) => {
    const profile = CITY_PROFILES[city] || CITY_PROFILES["Mumbai"];

    const weatherMult = getWeatherMultiplier(params.weather);
    // Scale each lever by city-specific weights
    const trafficImpact = (100 - params.traffic) * profile.trafficWeight;
    const industrialImpact = (100 - params.industrial) * profile.industrialWeight;
    const populationImpact =
      (100 - params.population) * profile.populationWeight;

    let overallImprovement =
      (trafficImpact + industrialImpact + populationImpact) * weatherMult;

    // Green cover: more trees → same actions yield slightly better health benefit
    const greenBoost = 1 + profile.greenCoverIndex * 0.2;
    overallImprovement *= greenBoost;

    // Cap & clamp
    overallImprovement = Math.max(
      0,
      Math.min(profile.baseCap, Math.round(overallImprovement / 10))
    );

    const pm25Reduction = Math.round(overallImprovement * 0.8);
    const healthRisk = Math.round(
      overallImprovement * profile.healthMultiplier
    );

    return {
      overallImprovement,
      pm25Reduction,
      healthRisk,
      baselineAQI: profile.baselineAQI,
    };
  };

  const generateCitySpecificNarrative = (
    city: string,
    params: any,
    impact: {
      overallImprovement: number;
      pm25Reduction: number;
      healthRisk: number;
      baselineAQI: number;
    }
  ) => {
    const profile = CITY_PROFILES[city] || CITY_PROFILES["Mumbai"];
    const weatherImpact = getWeatherImpact(params.weather);

    const header = `Scenario analysis (1 Dec 2025) for ${city} — projected impact under your input parameters:

Scenario configuration:
• Traffic: ${params.traffic}% of normal  
• Industrial activity: ${params.industrial}% of normal  
• Population density (exposure proxy): ${params.population}% of current levels  
• Weather pattern: ${params.weather} (${weatherImpact})  

Baseline context:
• Typical seasonal AQI in ${city} often hovers around ~${profile.baselineAQI}, with significant contributions from local traffic, construction dust and industrial sources.
`;

    const impactBlock = `
Projected impact (relative to a typical bad day in ${city}):
• Estimated overall AQI improvement: ~${impact.overallImprovement}%  
• Estimated PM₂.₅ reduction: ~${impact.pm25Reduction}%  
• Estimated relative health-risk reduction: ~${impact.healthRisk} (on this dashboard's internal risk scale)
`;

    const citySpecific = generateCitySpecificInsights(city, params, impact);

    const recommendations = generateRecommendations(city, params, impact);

    return `${header}${impactBlock}
Key findings for ${city}:
${citySpecific}

Recommendations:
${recommendations}

This scenario highlights how traffic, industry, weather and population density interact differently in ${city}, and why city-specific measures — not one-size-fits-all policies — are essential for cleaner urban air.`;
  };

  const generateCitySpecificInsights = (
    city: string,
    params: any,
    impact: any
  ) => {
    const lines: string[] = [];

    const highTraffic = params.traffic > 70;
    const highIndustry = params.industrial > 60;
    const veryDense = params.population > 80;
    const weather = params.weather;

    switch (city) {
      case "Delhi":
        if (highTraffic) {
          lines.push(
            "• With traffic remaining high, near-roadway pollution hotspots and winter smog episodes remain a major concern, even if some emissions are reduced elsewhere."
          );
        } else {
          lines.push(
            "• Aggressive traffic reduction substantially lowers peak roadside exposure in Delhi, especially during morning and evening rush hours."
          );
        }
        if (highIndustry) {
          lines.push(
            "• Industrial and construction emissions still dominate the background haze; without stricter stack controls and dust management, overall AQI gains are partially offset."
          );
        }
        if (weather === "foggy") {
          lines.push(
            "• Foggy, stagnant conditions in Delhi severely limit dispersion, so even strong emission cuts translate into modest short-term AQI improvements."
          );
        }
        break;

      case "Mumbai":
        if (weather === "windy" || weather === "rainy") {
          lines.push(
            "• Coastal winds and rainfall in Mumbai amplify the benefits of emission cuts, helping to flush pollutants seaward and wash out particulates."
          );
        } else if (weather === "foggy") {
          lines.push(
            "• When sea breeze weakens and haze builds up, reduced winds make it easier for construction dust and traffic emissions to linger over the city."
          );
        }
        if (!highTraffic && !highIndustry) {
          lines.push(
            "• Moderate reductions in both traffic and industrial activity combine with Mumbai’s coastal setting to push many neighbourhoods towards significantly cleaner air."
          );
        } else if (highTraffic && highIndustry) {
          lines.push(
            "• Keeping both traffic and industry near current levels means even the sea breeze cannot fully offset the buildup of pollutants over busy corridors and construction-heavy zones."
          );
        }
        break;

      case "Bengaluru":
        if (highTraffic) {
          lines.push(
            "• High traffic volumes on IT corridors and ring roads keep PM₁₀ and PM₂.₅ elevated, despite the city's historically better climate."
          );
        } else {
          lines.push(
            "• Reducing peak-hour congestion in Bengaluru can quickly translate into visible improvements along major commute routes."
          );
        }
        if (weather === "windy") {
          lines.push(
            "• Breezy conditions support dispersion, but ongoing road-digging and construction works still kick up dust unless actively controlled."
          );
        }
        if (veryDense) {
          lines.push(
            "• In dense, rapidly growing neighbourhoods, the loss of tree cover makes residents more vulnerable to any remaining emissions."
          );
        }
        break;

      case "Chennai":
        if (weather === "rainy") {
          lines.push(
            "• Monsoon or rainy conditions in Chennai typically wash out a significant fraction of coarse particles, amplifying the effect of emission reductions."
          );
        } else if (weather === "sunny") {
          lines.push(
            "• Hot, sunny days can elevate ozone and photochemical smog, so traffic controls remain important even when PM levels look moderate."
          );
        }
        if (highIndustry) {
          lines.push(
            "• Industrial clusters and port-related activity continue to influence background concentrations; without cleaner fuels and stack controls, baseline AQI remains stubbornly moderate-to-poor."
          );
        }
        break;

      case "Kolkata":
        if (highTraffic) {
          lines.push(
            "• Heavy reliance on diesel vehicles and congested roads keeps roadside AQI high, especially during business hours."
          );
        }
        if (highIndustry) {
          lines.push(
            "• Industrial emissions, waste burning and construction dust add to the persistent haze over Kolkata, limiting the impact of traffic-only measures."
          );
        }
        if (weather === "foggy") {
          lines.push(
            "• Fog and low-level inversions along the river basin trap pollutants close to the ground, worsening morning and late-evening smog."
          );
        }
        if (!lines.length) {
          lines.push(
            "• Even with moderate emission cuts, Kolkata’s dense built-up fabric and mixed pollution sources mean that improvements are noticeable but need to be sustained over time."
          );
        }
        break;

      default:
        lines.push(
          "• Emission reductions show a clear improvement in projected AQI, but the exact magnitude depends on local geography, sources and weather."
        );
    }

    return lines.join("\n");
  };

  const generateRecommendations = (
    city: string,
    params: any,
    impact: any
  ): string => {
    const recs: string[] = [];

    const highTraffic = params.traffic > 70;
    const midTraffic = params.traffic > 40 && params.traffic <= 70;
    const highIndustry = params.industrial > 60;
    const veryDense = params.population > 80;
    const weather = params.weather;

    // Generic knobs
    if (highTraffic) {
      recs.push(
        "• Implement stronger traffic management: congestion pricing, car-free zones, staggered work hours and better public transport alternatives."
      );
    } else if (midTraffic) {
      recs.push(
        "• Consolidate moderate traffic reductions with better bus/metro frequency and last-mile connectivity so people stick with low-emission travel."
      );
    }

    if (highIndustry) {
      recs.push(
        "• Tighten industrial emission norms, enforce stack monitoring and promote cleaner fuels and filters in nearby industrial clusters."
      );
    }

    if (weather === "foggy") {
      recs.push(
        "• Issue targeted health advisories on foggy, stagnant days, especially for children, elderly and those with heart or lung disease."
      );
    }

    if (veryDense) {
      recs.push(
        "• In very dense neighbourhoods, expand green buffers, pocket parks and roadside tree plantations to reduce exposure in micro-hotspots."
      );
    }

    // City-specific flavour
    switch (city) {
      case "Delhi":
        recs.push(
          "• In Delhi, combine traffic and industrial controls with strong action on biomass burning and regional sources to prevent recurring winter smog episodes."
        );
        break;
      case "Mumbai":
        recs.push(
          "• In Mumbai, focus on dust control at construction sites, stricter norms for diesel vehicles and protecting coastal green belts that support natural ventilation."
        );
        break;
      case "Bengaluru":
        recs.push(
          "• In Bengaluru, protect remaining tree cover, design complete streets for walking and cycling, and coordinate roadworks to minimise chronic dust."
        );
        break;
      case "Chennai":
        recs.push(
          "• In Chennai, leverage monsoon and sea-breeze windows by scheduling heavy construction and freight movement when natural dispersion is strongest."
        );
        break;
      case "Kolkata":
        recs.push(
          "• In Kolkata, prioritise cleaner public transport fleets, curb waste burning and enforce dust control at construction and roadside works."
        );
        break;
    }

    if (!recs.length) {
      recs.push(
        "• Current parameters indicate moderate conditions for air quality — continue monitoring and gradually strengthen traffic and industrial controls."
      );
    }

    return recs.join("\n");
  };

  // ---------- Effects ----------

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

  // ---------- Render ----------

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
