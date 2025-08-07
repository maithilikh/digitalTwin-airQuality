import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ForecastChartProps {
  data: any;
  timeRange: string;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ data, timeRange }) => {
  const getTimeLabels = () => {
    const now = new Date();
    const labels = [];
    const intervals = timeRange === '24h' ? 24 : timeRange === '48h' ? 48 : 168;
    const step = timeRange === '7d' ? 6 : 1;
    
    for (let i = 0; i < intervals; i += step) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      if (timeRange === '7d') {
        labels.push(time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
      } else {
        labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }
    }
    return labels;
  };

  const generateForecastData = () => {
    const labels = getTimeLabels();
    const currentAQI = 65;
    const actualData = [];
    const predictedData = [];
    const confidenceUpper = [];
    const confidenceLower = [];
    
    // Generate historical data (first half)
    for (let i = 0; i < labels.length / 2; i++) {
      const variation = Math.sin(i * 0.5) * 15 + Math.random() * 20 - 10;
      const value = Math.max(0, currentAQI + variation);
      actualData.push(value);
      predictedData.push(null);
      confidenceUpper.push(null);
      confidenceLower.push(null);
    }
    
    // Generate forecast data (second half)
    let lastValue = actualData[actualData.length - 1];
    for (let i = labels.length / 2; i < labels.length; i++) {
      const trend = Math.sin(i * 0.3) * 10;
      const predicted = Math.max(0, lastValue + trend + Math.random() * 10 - 5);
      const confidence = 10 + (i - labels.length / 2) * 2;
      
      actualData.push(null);
      predictedData.push(predicted);
      confidenceUpper.push(predicted + confidence);
      confidenceLower.push(predicted - confidence);
      lastValue = predicted;
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Actual AQI',
          data: actualData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Predicted AQI',
          data: predictedData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Confidence Upper',
          data: confidenceUpper,
          borderColor: 'rgba(239, 68, 68, 0.3)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: '+1',
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
        {
          label: 'Confidence Lower',
          data: confidenceLower,
          borderColor: 'rgba(239, 68, 68, 0.3)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
        }
      ]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          filter: (legendItem: any) => legendItem.text !== 'Confidence Upper' && legendItem.text !== 'Confidence Lower'
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            if (context.dataset.label === 'Confidence Upper' || context.dataset.label === 'Confidence Lower') {
              return null;
            }
            return `${context.dataset.label}: ${Math.round(context.parsed.y)} AQI`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: timeRange === '7d' ? 'Date' : 'Time'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'AQI'
        },
        min: 0,
        max: 200,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const chartData = generateForecastData();

  return (
    <div className="h-96">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ForecastChart;