"use client"

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
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function TrafficFlowChart({ timeRange }) {
  // Adjust data based on timeRange
  let labels = []
  let dataPoints = []

  switch (timeRange) {
    case "24h":
      labels = ["12am", "2am", "4am", "6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm", "10pm"]
      dataPoints = [1200, 800, 600, 1500, 5200, 6800, 4500, 4200, 5800, 7200, 4300, 2100]
      break
    case "7d":
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      dataPoints = [45000, 48000, 47000, 49000, 53000, 32000, 28000]
      break
    case "30d":
      labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
      dataPoints = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50000) + 20000)
      break
    default:
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      dataPoints = [
        1200000, 1300000, 1250000, 1400000, 1500000, 1600000, 1700000, 1650000, 1550000, 1450000, 1350000, 1250000,
      ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 7,
        backgroundColor: "rgb(16, 185, 129)",
        borderColor: "white",
        borderWidth: 2,
      },
    },
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Traffic Volume",
        data: dataPoints,
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        fill: true,
      },
    ],
  }

  return <Line options={options} data={data} />
}

