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
import { useEffect, useState } from "react"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// Date constants for the dataset
const DATA_START_DATE = new Date("2025-01-05")
const DATA_END_DATE = new Date("2025-03-29")

interface TrafficDataPoint {
  date: Date;
  entries: number;
}

interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
}

interface ChartDataState {
  labels: string[];
  datasets: ChartDataset[];
}

interface TrafficFlowChartProps {
  timeRange: string;
}

export default function TrafficFlowChart({ timeRange }: TrafficFlowChartProps) {
  const [chartData, setChartData] = useState<ChartDataState>({
    labels: [],
    datasets: [
      {
        label: "CRZ Entries",
        data: [],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        fill: true,
      },
    ],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Since we have individual files for each entry point, we'll simulate a "total" by fetching Lincoln_Tunnel
        // In a real application, we would aggregate data from all entry points
        const response = await fetch("/data/Lincoln_Tunnel.csv")
        const csvText = await response.text()
        
        // Parse CSV (header row + data rows)
        const rows = csvText.trim().split("\n")
        const headers = rows[0].split(",")
        
        // Find indices of important columns
        const dateIndex = headers.indexOf("Toll Date")
        const entriesIndex = headers.indexOf("CRZ Entries")
        
        if (dateIndex === -1 || entriesIndex === -1) {
          console.error("Missing required columns in CSV")
          return
        }
        
        // Process data rows
        const parsedData: TrafficDataPoint[] = rows.slice(1)
          .map(row => {
            const columns = row.split(",")
            if (columns.length <= Math.max(dateIndex, entriesIndex)) return null
            
            const dateStr = columns[dateIndex]
            const entries = parseInt(columns[entriesIndex], 10)
            
            if (isNaN(entries)) return null
            
            // Parse date (MM/DD/YYYY format)
            const dateParts = dateStr.split("/")
            if (dateParts.length !== 3) return null
            
            const month = parseInt(dateParts[0], 10)
            const day = parseInt(dateParts[1], 10)
            const year = parseInt(dateParts[2], 10)
            
            if (isNaN(month) || isNaN(day) || isNaN(year)) return null
            
            const date = new Date(year, month - 1, day)
            
            return {
              date,
              entries
            }
          })
          .filter((item): item is TrafficDataPoint => item !== null)
        
        // Sort by date
        parsedData.sort((a, b) => a.date.getTime() - b.date.getTime())
        
        // Filter and aggregate based on timeRange
        let filteredLabels: string[] = []
        let filteredData: number[] = []
        
        switch (timeRange) {
          case "24h": {
            // Last day hourly data (simulate with 12 data points)
            const lastDay = new Date(DATA_END_DATE)
            lastDay.setHours(0, 0, 0, 0)
            
            // Create hourly bins for the last day
            const hours = ["12am", "2am", "4am", "6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm", "10pm"]
            
            // Find entries for the last day
            const lastDayData = parsedData.filter(item => 
              item.date.getDate() === lastDay.getDate() && 
              item.date.getMonth() === lastDay.getMonth() && 
              item.date.getFullYear() === lastDay.getFullYear()
            )
            
            if (lastDayData.length > 0) {
              // If we have data for the last day, distribute it across hours based on typical traffic patterns
              // This is a simulation as we don't have hourly data
              const totalEntries = lastDayData.reduce((sum, item) => sum + item.entries, 0)
              const hourlyDistribution = [0.02, 0.01, 0.01, 0.03, 0.1, 0.15, 0.1, 0.09, 0.13, 0.18, 0.12, 0.06]
              
              filteredLabels = hours
              filteredData = hourlyDistribution.map(factor => Math.round(totalEntries * factor))
            } else {
              // Fallback if no data for the last day
              filteredLabels = hours
              filteredData = [1200, 800, 600, 1500, 5200, 6800, 4500, 4200, 5800, 7200, 4300, 2100]
            }
            break
          }
          
          case "7d": {
            // Last 7 days
            const lastWeekStart = new Date(DATA_END_DATE)
            lastWeekStart.setDate(lastWeekStart.getDate() - 6)
            
            // Filter data for the last week
            const lastWeekData = parsedData.filter(item => item.date >= lastWeekStart && item.date <= DATA_END_DATE)
            
            // Group by day
            const dayMap = new Map<string, { total: number, count: number }>()
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            
            lastWeekData.forEach(item => {
              const dayOfWeek = item.date.getDay()
              const key = dayNames[dayOfWeek]
              
              if (!dayMap.has(key)) {
                dayMap.set(key, { total: 0, count: 0 })
              }
              
              const current = dayMap.get(key)
              if (current) {
                current.total += item.entries
                current.count += 1
              }
            })
            
            // Create a 7-day array starting from appropriate day
            const startDayIdx = lastWeekStart.getDay()
            const orderedDays = Array.from({ length: 7 }, (_, i) => dayNames[(startDayIdx + i) % 7])
            
            filteredLabels = orderedDays
            filteredData = orderedDays.map(day => {
              const data = dayMap.get(day)
              return data ? Math.round(data.total / data.count) : 0
            })
            break
          }
          
          case "30d": {
            // Last 30 days
            const lastMonthStart = new Date(DATA_END_DATE)
            lastMonthStart.setDate(lastMonthStart.getDate() - 29)
            
            // Filter for last month
            const lastMonthData = parsedData.filter(item => item.date >= lastMonthStart && item.date <= DATA_END_DATE)
            
            // Group by day of month
            const dayMap = new Map<string, { total: number, count: number, date: Date }>()
            
            lastMonthData.forEach(item => {
              const dayStr = `${item.date.getMonth() + 1}/${item.date.getDate()}`
              
              if (!dayMap.has(dayStr)) {
                dayMap.set(dayStr, { total: 0, count: 0, date: new Date(item.date) })
              }
              
              const current = dayMap.get(dayStr)
              if (current) {
                current.total += item.entries
                current.count += 1
              }
            })
            
            // Sort by date
            const sortedDays = Array.from(dayMap.entries())
              .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
            
            filteredLabels = sortedDays.map(([day]) => day)
            filteredData = sortedDays.map(([_, data]) => Math.round(data.total / data.count))
            break
          }
          
          default: {
            // All data - group by month
            const monthMap = new Map<string, { total: number, count: number }>()
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            
            parsedData.forEach(item => {
              const month = item.date.getMonth()
              const monthName = monthNames[month]
              
              if (!monthMap.has(monthName)) {
                monthMap.set(monthName, { total: 0, count: 0 })
              }
              
              const current = monthMap.get(monthName)
              if (current) {
                current.total += item.entries
                current.count += 1
              }
            })
            
            // We know we only have Jan-Mar data
            const availableMonths = ["Jan", "Feb", "Mar"]
            
            filteredLabels = availableMonths
            filteredData = availableMonths.map(month => {
              const data = monthMap.get(month)
              return data ? Math.round(data.total / data.count) : 0
            })
          }
        }
        
        // Update chart data
        setChartData({
          labels: filteredLabels,
          datasets: [
            {
              label: "CRZ Entries",
              data: filteredData,
              borderColor: "rgb(16, 185, 129)",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              fill: true,
            },
          ],
        })
      } catch (error) {
        console.error("Error fetching traffic flow data:", error)
        // Fallback to mock data
        setDefaultMockData(timeRange)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [timeRange])
  
  // Fallback function if data fetch fails
  const setDefaultMockData = (timeRange: string) => {
    let labels: string[] = []
    let dataPoints: number[] = []

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
        labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`)
        dataPoints = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50000) + 20000)
        break
      default:
        labels = ["Jan", "Feb", "Mar"]
        dataPoints = [1200000, 1300000, 1250000]
    }

    setChartData({
      labels,
      datasets: [
        {
          label: "CRZ Entries",
          data: dataPoints,
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          fill: true,
        },
      ],
    })
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
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          title: function(tooltipItems: any[]) {
            return `Date: ${tooltipItems[0].label}`;
          },
          label: function(context: any) {
            return `Entries: ${context.raw.toLocaleString()}`;
          }
        }
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
            weight: 'bold' as const,
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
            weight: 'bold' as const,
          },
          callback: function(value: number) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K';
            }
            return value;
          }
        },
        beginAtZero: true,
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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {isLoading && (
        <div style={{ 
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)",
          color: "white",
          fontSize: "14px"
        }}>
          Loading data...
        </div>
      )}
      <Line options={options} data={chartData} />
    </div>
  )
}

