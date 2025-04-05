"use client"

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Recent Sales",
    },
  },
}

const labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const data = {
  labels,
  datasets: [
    {
      label: "Sales",
      data: [12, 19, 3, 5, 2, 3, 9],
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
}

export default function BarChart() {
  return <Bar options={options} data={data} />
}

