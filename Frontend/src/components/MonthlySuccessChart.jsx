import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function MonthlySuccessChart({ data }) {
   // Format month names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const labels = data.map(item => {
    const [year, month] = item.month.split("-");
    return `${monthNames[month - 1]}`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "Success Rate (%)",
        data: data.map(item => item.successRate),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.3)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
