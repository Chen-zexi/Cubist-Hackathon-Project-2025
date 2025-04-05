"use client"

import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js"
import { Scatter } from "react-chartjs-2"

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend)

const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

const data = {
  datasets: [
    {
      label: "Time Spent vs Pages Viewed",
      data: Array.from({ length: 100 }, () => ({
        x: Math.random() * 10,
        y: Math.random() * 30,
      })),
      backgroundColor: "rgba(255, 99, 132, 1)",
    },
  ],
}

export default function ScatterChart() {
  return <Scatter options={options} data={data} />
}

