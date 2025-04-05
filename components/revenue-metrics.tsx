"use client"

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function RevenueMetrics({ timeRange }) {
  // Adjust data based on timeRange
  let labels = []
  let revenueData = []
  let projectedData = []

  switch (timeRange) {
    case "24h":
      labels = ["12am", "4am", "8am", "12pm", "4pm", "8pm"]
      revenueData = [12000, 8000, 65000, 45000, 58000, 30000]
      projectedData = [15000, 10000, 70000, 50000, 62000, 35000]
      break
    case "7d":
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      revenueData = [220000, 240000, 235000, 245000, 265000, 160000, 140000]
      projectedData = [230000, 250000, 245000, 255000, 275000, 170000, 150000]
      break
    default:
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"]
      revenueData = [1200000, 1350000, 1250000, 1400000]
      projectedData = [1300000, 1450000, 1350000, 1500000]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "rgba(255, 255, 255, 1)",
          padding: 20,
          font: {
            size: 12,
            weight: "500",
          },
          usePointStyle: true,
          pointStyle: "rect",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        padding: 10,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.08)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.9)",
          font: {
            size: 11,
            weight: "500",
          },
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.08)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.9)",
          font: {
            size: 11,
            weight: "500",
          },
          callback: (value) => {
            if (value >= 1000000) return "$" + (value / 1000000).toFixed(1) + "M"
            if (value >= 1000) return "$" + (value / 1000).toFixed(0) + "K"
            return "$" + value
          },
        },
      },
    },
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Actual Revenue",
        data: revenueData,
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Projected Revenue",
        data: projectedData,
        backgroundColor: "rgba(14, 165, 233, 0.3)",
        borderColor: "rgba(14, 165, 233, 0.8)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  return <Bar options={options} data={data} />
}

