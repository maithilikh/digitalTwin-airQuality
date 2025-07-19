import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HistoricalChartProps {
  data: any;
  city: string;
  pollutant: string;
  dateRange: string;
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({
  data,
  city,
  pollutant,
  dateRange,
}) => {
  const generateHistoricalData = () => {
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const labels = [];
    const aqiData = [];
    const pm25Data = [];
    const ozoneData = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      if (days <= 7) {
        labels.push(
          date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        );
      } else if (days <= 30) {
        labels.push(
          date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        );
      } else {
        labels.push(
          date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
        );
      }

      // Generate mock data with some patterns
      const seasonalFactor =
        Math.sin((date.getMonth() / 12) * Math.PI * 2) * 20;
      const weeklyFactor = Math.sin((date.getDay() / 7) * Math.PI * 2) * 10;
      const randomFactor = Math.random() * 30 - 15;

      const baseAQI = 65 + seasonalFactor + weeklyFactor + randomFactor;
      aqiData.push(Math.max(0, Math.min(200, baseAQI)));

      const basePM25 =
        25 + seasonalFactor * 0.8 + weeklyFactor * 0.6 + randomFactor * 0.5;
      pm25Data.push(Math.max(0, basePM25));

      const baseOzone =
        45 + seasonalFactor * 0.6 + weeklyFactor * 0.4 + randomFactor * 0.3;
      ozoneData.push(Math.max(0, baseOzone));
    }

    const datasets = [];

    if (pollutant === "pm25" || pollutant === "all") {
      datasets.push({
        label: "PM2.5 (μg/m³)",
        data: pm25Data,
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      });
    }

    if (pollutant === "o3" || pollutant === "all") {
      datasets.push({
        label: "Ozone (ppb)",
        data: ozoneData,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      });
    }

    datasets.push({
      label: "AQI",
      data: aqiData,
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 5,
    });

    return {
      labels,
      datasets,
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Date",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Value",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  const chartData = generateHistoricalData();

  return (
    <div className="space-y-4">
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 mb-1">Average AQI</div>
          <div className="text-2xl font-bold text-blue-900">
            {Math.round(
              chartData.datasets[chartData.datasets.length - 1].data.reduce(
                (a: number, b: number) => a + b,
                0
              ) / chartData.datasets[chartData.datasets.length - 1].data.length
            )}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-red-600 mb-1">Peak AQI</div>
          <div className="text-2xl font-bold text-red-900">
            {Math.round(
              Math.max(
                ...chartData.datasets[chartData.datasets.length - 1].data
              )
            )}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 mb-1">Best AQI</div>
          <div className="text-2xl font-bold text-green-900">
            {Math.round(
              Math.min(
                ...chartData.datasets[chartData.datasets.length - 1].data
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalChart;
