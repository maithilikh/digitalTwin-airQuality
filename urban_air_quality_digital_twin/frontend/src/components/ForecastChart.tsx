import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForecastChartProps {
  data: any;
  timeRange: string;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ timeRange }) => {
  // ---- LABEL GENERATION ----
  const getTimeLabels = () => {
    const now = new Date("2025-12-01T00:00:00");
    const labels = [];
    const intervals = timeRange === "24h" ? 24 : timeRange === "48h" ? 48 : 168;
    const step = timeRange === "7d" ? 24 : 1;

    for (let i = 0; i < intervals; i += step) {
      const t = new Date(now.getTime() + i * 3600 * 1000);
      labels.push(
        timeRange === "7d"
          ? t.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
          : t.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
      );
    }
    return labels;
  };

  // ---- REALISTIC AQI CLEAN DATA ----
  const generateForecastData = () => {
    const labels = getTimeLabels();

    // Base AQI pattern for a typical Indian city in December:
    // Morning low → Midday moderate → Evening higher due to traffic + winter inversion
    const realisticPattern24 = [
      82,
      84,
      85,
      87,
      90,
      92,
      95,
      97, // early
      100,
      102,
      105,
      108,
      110,
      112,
      115,
      118, // midday peak
      120,
      122,
      118,
      115,
      110,
      105,
      95,
      90, // night decrease
    ];

    const baseData =
      timeRange === "24h"
        ? realisticPattern24
        : timeRange === "48h"
        ? [...realisticPattern24, ...realisticPattern24.map((v) => v - 5)]
        : [
            ...realisticPattern24,
            ...realisticPattern24,
            ...realisticPattern24,
            ...realisticPattern24,
            ...realisticPattern24,
            ...realisticPattern24,
            ...realisticPattern24,
          ];

    // Split actual (first 30%) and predicted (rest)
    const splitIndex = Math.floor(baseData.length * 0.3);

    const actualData = baseData.map((v, i) => (i < splitIndex ? v : null));
    const predictedData = baseData.map((v, i) => (i >= splitIndex ? v : null));

    // Confidence bands (± 8–15 AQI realistic)
    const confidenceUpper = predictedData.map((v) => (v ? v + 12 : null));
    const confidenceLower = predictedData.map((v) => (v ? v - 12 : null));

    return {
      labels,
      datasets: [
        {
          label: "Actual AQI",
          data: actualData,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: false,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: "Predicted AQI",
          data: predictedData,
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderDash: [5, 5],
          fill: false,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: "Confidence Upper",
          data: confidenceUpper,
          borderColor: "rgba(239, 68, 68, 0.3)",
          backgroundColor: "rgba(239, 68, 68, 0.08)",
          fill: "+1",
          tension: 0.3,
          pointRadius: 0,
        },
        {
          label: "Confidence Lower",
          data: confidenceLower,
          borderColor: "rgba(239, 68, 68, 0.3)",
          backgroundColor: "rgba(239, 68, 68, 0.08)",
          fill: false,
          tension: 0.3,
          pointRadius: 0,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          filter: (item: any) =>
            item.text !== "Confidence Upper" &&
            item.text !== "Confidence Lower",
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            // return undefined (void) when we don't want a tooltip line instead of `null`
            if (
              !ctx.dataset ||
              !ctx.dataset.label ||
              ctx.dataset.label.includes("Confidence")
            )
              return;
            return `${ctx.dataset.label}: ${ctx.parsed?.y ?? ctx.parsed} AQI`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 200,
      },
    },
  };

  const chartData = generateForecastData();

  return (
    <div className="h-96">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ForecastChart;

// import React, { useEffect, useRef } from 'react';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
// import { Line } from 'react-chartjs-2';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// interface ForecastChartProps {
//   data: any;
//   timeRange: string;
// }

// const ForecastChart: React.FC<ForecastChartProps> = ({ data, timeRange }) => {
//   const getTimeLabels = () => {
//     const now = new Date();
//     const labels = [];
//     const intervals = timeRange === '24h' ? 24 : timeRange === '48h' ? 48 : 168;
//     const step = timeRange === '7d' ? 6 : 1;

//     for (let i = 0; i < intervals; i += step) {
//       const time = new Date(now.getTime() + i * 60 * 60 * 1000);
//       if (timeRange === '7d') {
//         labels.push(time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
//       } else {
//         labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
//       }
//     }
//     return labels;
//   };

//   const generateForecastData = () => {
//     const labels = getTimeLabels();
//     const currentAQI = 65;
//     const actualData = [];
//     const predictedData = [];
//     const confidenceUpper = [];
//     const confidenceLower = [];

//     // Generate historical data (first half)
//     for (let i = 0; i < labels.length / 2; i++) {
//       const variation = Math.sin(i * 0.5) * 15 + Math.random() * 20 - 10;
//       const value = Math.max(0, currentAQI + variation);
//       actualData.push(value);
//       predictedData.push(null);
//       confidenceUpper.push(null);
//       confidenceLower.push(null);
//     }

//     // Generate forecast data (second half)
//     let lastValue = actualData[actualData.length - 1];
//     for (let i = labels.length / 2; i < labels.length; i++) {
//       const trend = Math.sin(i * 0.3) * 10;
//       const predicted = Math.max(0, lastValue + trend + Math.random() * 10 - 5);
//       const confidence = 10 + (i - labels.length / 2) * 2;

//       actualData.push(null);
//       predictedData.push(predicted);
//       confidenceUpper.push(predicted + confidence);
//       confidenceLower.push(predicted - confidence);
//       lastValue = predicted;
//     }

//     return {
//       labels,
//       datasets: [
//         {
//           label: 'Actual AQI',
//           data: actualData,
//           borderColor: 'rgb(59, 130, 246)',
//           backgroundColor: 'rgba(59, 130, 246, 0.1)',
//           fill: false,
//           tension: 0.4,
//           pointRadius: 3,
//           pointHoverRadius: 6,
//         },
//         {
//           label: 'Predicted AQI',
//           data: predictedData,
//           borderColor: 'rgb(239, 68, 68)',
//           backgroundColor: 'rgba(239, 68, 68, 0.1)',
//           borderDash: [5, 5],
//           fill: false,
//           tension: 0.4,
//           pointRadius: 3,
//           pointHoverRadius: 6,
//         },
//         {
//           label: 'Confidence Upper',
//           data: confidenceUpper,
//           borderColor: 'rgba(239, 68, 68, 0.3)',
//           backgroundColor: 'rgba(239, 68, 68, 0.1)',
//           fill: '+1',
//           tension: 0.4,
//           pointRadius: 0,
//           pointHoverRadius: 0,
//         },
//         {
//           label: 'Confidence Lower',
//           data: confidenceLower,
//           borderColor: 'rgba(239, 68, 68, 0.3)',
//           backgroundColor: 'rgba(239, 68, 68, 0.1)',
//           fill: false,
//           tension: 0.4,
//           pointRadius: 0,
//           pointHoverRadius: 0,
//         }
//       ]
//     };
//   };

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//         labels: {
//           filter: (legendItem: any) => legendItem.text !== 'Confidence Upper' && legendItem.text !== 'Confidence Lower'
//         }
//       },
//       title: {
//         display: false,
//       },
//       tooltip: {
//         mode: 'index' as const,
//         intersect: false,
//         callbacks: {
//           label: (context: any) => {
//             if (context.dataset.label === 'Confidence Upper' || context.dataset.label === 'Confidence Lower') {
//               return null;
//             }
//             return `${context.dataset.label}: ${Math.round(context.parsed.y)} AQI`;
//           }
//         }
//       }
//     },
//     scales: {
//       x: {
//         display: true,
//         title: {
//           display: true,
//           text: timeRange === '7d' ? 'Date' : 'Time'
//         },
//         grid: {
//           color: 'rgba(0, 0, 0, 0.1)'
//         }
//       },
//       y: {
//         display: true,
//         title: {
//           display: true,
//           text: 'AQI'
//         },
//         min: 0,
//         max: 200,
//         grid: {
//           color: 'rgba(0, 0, 0, 0.1)'
//         }
//       }
//     },
//     interaction: {
//       mode: 'nearest' as const,
//       axis: 'x' as const,
//       intersect: false
//     }
//   };

//   const chartData = generateForecastData();

//   return (
//     <div className="h-96">
//       <Line data={chartData} options={options} />
//     </div>
//   );
// };

// export default ForecastChart;
