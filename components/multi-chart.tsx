// Add this at the very top of the file, before "use client"
declare module 'lightweight-charts' {
  interface IChartApi {
    addCandlestickSeries(options?: any): ISeriesApi<'Candlestick'>;
  }
  
  interface PriceScaleOptions {
    title?: string;
  }
}

"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// We need to use the full import to fix type issues
import * as LightweightCharts from 'lightweight-charts'

// List of detection groups
const DETECTION_GROUPS = [
  'Brooklyn_Bridge',
  'West_Side_Highway_at_60th_St',
  'West_60th_St',
  'Queensboro_Bridge',
  'Queens_Midtown_Tunnel',
  'Lincoln_Tunnel',
  'Holland_Tunnel',
  'FDR_Drive_at_60th_St',
  'East_60th_St',
  'Williamsburg_Bridge',
  'Manhattan_Bridge',
  'Hugh_L_Carey_Tunnel'
]

interface ChartData {
  time: LightweightCharts.Time;
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp?: string;
  color?: string;
  wickColor?: string;
}

// Function to process CSV data
async function processCSVData(csvText: string): Promise<ChartData[]> {
  const rows = csvText.trim().split('\n');
  const headers = rows[0].split(',');
  
  const tollDateIndex = headers.indexOf('Toll Date');
  const crzEntriesIndex = headers.indexOf('CRZ Entries');
  
  if (tollDateIndex === -1 || crzEntriesIndex === -1) {
    console.error('Missing required columns in CSV');
    return [];
  }
  
  // Extract rows
  const validRows = rows.slice(1)
    .map(row => {
      const columns = row.split(',');
      if (columns.length <= Math.max(tollDateIndex, crzEntriesIndex)) return null;
      
      const crzEntries = parseInt(columns[crzEntriesIndex], 10);
      if (isNaN(crzEntries) || crzEntries < 0) return null; // Skip negative entries
      
      const dateStr = columns[tollDateIndex];
      const dateParts = dateStr.split('/');
      if (dateParts.length !== 3) return null;
      
      const [month, day, year] = dateParts;
      // Create a base timestamp for the date
      const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      const timestamp = Math.floor(date.getTime() / 1000);
      
      return {
        timestamp,
        value: Math.max(0, crzEntries), // Ensure entries are non-negative
        date: date
      };
    })
    .filter(r => r !== null);
  
  // Group by date and create multiple entries per day (hourly distribution)
  const ohlcByDate: Record<number, any> = {};
  
  validRows.forEach((row: any) => {
    const dateKey = row.timestamp;
    
    if (!ohlcByDate[dateKey]) {
      ohlcByDate[dateKey] = {
        values: [],
        open: row.value,
        high: row.value,
        low: row.value,
        close: row.value,
        date: row.date
      };
    }
    
    ohlcByDate[dateKey].values.push(row.value);
    ohlcByDate[dateKey].high = Math.max(ohlcByDate[dateKey].high, row.value);
    ohlcByDate[dateKey].low = Math.min(ohlcByDate[dateKey].low, row.value);
    ohlcByDate[dateKey].close = row.value; // Last value becomes close
  });
  
  // Expand each day into multiple data points throughout the day
  let chartData: ChartData[] = [];
  
  Object.values(ohlcByDate).forEach((dayData: any) => {
    // Create a base candle for the day
    const dayCandle = {
      time: Math.floor(dayData.date.getTime() / 1000) as LightweightCharts.Time,
      open: dayData.open,
      high: dayData.high,
      low: dayData.low,
      close: dayData.close,
      // Add timestamp info for display
      timestamp: dayData.date.toLocaleDateString()
    };
    chartData.push(dayCandle);
    
    // Create additional intraday candles for more detailed visualization
    // Morning, midday, and afternoon sessions (simulated data based on daily value)
    const baseValue = dayData.open;
    const range = dayData.high - dayData.low;
    
    // Morning session - 9 AM
    const morningDate = new Date(dayData.date);
    morningDate.setHours(9, 0, 0, 0);
    const morningValue = baseValue + (Math.random() * 0.4 - 0.2) * range;
    
    // Midday session - 12 PM
    const middayDate = new Date(dayData.date);
    middayDate.setHours(12, 0, 0, 0);
    const middayValue = morningValue + (Math.random() * 0.6 - 0.3) * range;
    
    // Afternoon session - 4 PM
    const afternoonDate = new Date(dayData.date);
    afternoonDate.setHours(16, 0, 0, 0);
    const afternoonValue = dayData.close;
    
    // Add these sessions to the chart data (simulating intraday movements)
    chartData.push({
      time: Math.floor(morningDate.getTime() / 1000) as LightweightCharts.Time,
      open: baseValue,
      high: Math.max(baseValue, morningValue),
      low: Math.min(baseValue, morningValue),
      close: morningValue,
      timestamp: morningDate.toLocaleString()
    });
    
    chartData.push({
      time: Math.floor(middayDate.getTime() / 1000) as LightweightCharts.Time,
      open: morningValue,
      high: Math.max(morningValue, middayValue),
      low: Math.min(morningValue, middayValue),
      close: middayValue,
      timestamp: middayDate.toLocaleString()
    });
    
    chartData.push({
      time: Math.floor(afternoonDate.getTime() / 1000) as LightweightCharts.Time,
      open: middayValue,
      high: Math.max(middayValue, afternoonValue),
      low: Math.min(middayValue, afternoonValue),
      close: afternoonValue,
      timestamp: afternoonDate.toLocaleString()
    });
  });
  
  // Sort by time
  chartData.sort((a, b) => +a.time - +b.time);
  
  return chartData;
}

// Generate mock data for testing or when real data fails to load
function generateMockData(groupName: string): ChartData[] {
  const mockData: ChartData[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Go back 30 days
  
  let baseValue = 1000 + Math.random() * 2000; // Random starting value between 1000-3000
  
  // Group-specific volatility
  const volatility = groupName.includes('Bridge') ? 0.03 : 0.05;
  
  // Create 30 days of data
  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    
    // Random change (up to volatility %)
    const change = baseValue * (Math.random() * volatility * 2 - volatility);
    const newValue = Math.max(100, baseValue + change);
    
    mockData.push({
      time: Math.floor(currentDate.getTime() / 1000) as LightweightCharts.Time,
      open: baseValue,
      high: Math.max(baseValue, newValue),
      low: Math.min(baseValue, newValue),
      close: newValue,
      timestamp: currentDate.toLocaleDateString()
    });
    
    baseValue = newValue;
  }
  
  return mockData;
}

interface DetectionGroupChartProps {
  groupName: string;
}

// Single Detection Group Chart Component
function DetectionGroupChart({ groupName }: DetectionGroupChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef<LightweightCharts.IChartApi | null>(null);
  const seriesRef = useRef<LightweightCharts.ISeriesApi<'Candlestick'> | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const updateGeneratorRef = useRef<Generator<ChartData, null, unknown> | null>(null);
  
  // Cleanup function to clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);
  
  useEffect(() => {
    async function initChart() {
      if (!chartContainerRef.current) return;
      
      const container = chartContainerRef.current;
      let initialData: ChartData[] = [];
      
      try {
        // Attempt to load real data from public/data directory
        console.log(`Attempting to fetch data for ${groupName} from /data/${groupName}.csv`);
        const response = await fetch(`/data/${groupName}.csv`);
        
        if (!response.ok) {
          console.error(`Failed to load ${groupName}.csv with status: ${response.status}`);
          throw new Error(`Could not load CSV file for ${groupName}`);
        }
        
        console.log(`Successfully loaded data for ${groupName}`);
        const csvText = await response.text();
        initialData = await processCSVData(csvText);
        
        if (!initialData || initialData.length === 0) {
          throw new Error(`No valid data found for ${groupName}`);
        }
      } catch (error: any) {
        console.error(`Error loading data for ${groupName}:`, error);
        console.log(`Generating mock data for ${groupName} instead`);
        
        // If real data fails, use mock data so we can still show something
        initialData = generateMockData(groupName);
      }
      
      try {
        // At this point we have either real or mock data, so create the chart
        if (!container) return; // Double-check container still exists
        
        // Create chart with appropriate options
        const chart = LightweightCharts.createChart(container, {
          layout: {
            textColor: 'black',
            background: { 
              // @ts-ignore - Type issue with 'solid' being assignable to ColorType
              type: 'solid', 
              color: 'white' 
            },
            fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif',
          },
          height: 250,
          width: container.clientWidth,
          rightPriceScale: {
            autoScale: true,
            scaleMargins: {
              top: 0.1,
              bottom: 0.1
            },
            borderVisible: false,
            entireTextOnly: true,
          },
          timeScale: {
            rightOffset: 5,
            barSpacing: 15,
            fixLeftEdge: true,
            lockVisibleTimeRangeOnResize: true,
            tickMarkFormatter: (time: number) => {
              const date = new Date(time * 1000);
              return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }
          },
          grid: {
            horzLines: {
              visible: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            vertLines: {
              visible: true,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          localization: {
            timeFormatter: (time: number) => {
              const date = new Date(time * 1000);
              return date.toLocaleString();
            },
          },
          handleScroll: {
            mouseWheel: true,
            pressedMouseMove: true,
          },
          handleScale: {
            axisPressedMouseMove: true,
            mouseWheel: true,
            pinch: true,
          },
          crosshair: {
            mode: 1,
          }
        });
        
        chartRef.current = chart;
        
        // Add candlestick series
        const series = chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
          priceScaleId: 'right',
          priceFormat: {
            type: 'price',
            precision: 0,
            minMove: 1,
          }
        });
        
        seriesRef.current = series;
        
        // Configure price scale
        series.priceScale().applyOptions({
          scaleMargins: {
            top: 0.1,
            bottom: 0.1  
          },
          entireTextOnly: true,
          borderVisible: false,
          title: 'CRZ Entries',
          autoScale: true,
        });
        
        // Format data with coloring
        let previousClose: number | null = null;
        const formattedData = initialData.map((candle, index) => {
          if (index === 0) {
            previousClose = candle.close;
            return {
              ...candle,
              color: '#26a69a',
              wickColor: '#26a69a'
            };
          }
          
          const isUp = candle.close >= (previousClose as number);
          const color = isUp ? '#26a69a' : '#ef5350';
          const result = {
            ...candle,
            color: color,
            wickColor: color
          };
          
          previousClose = candle.close;
          return result;
        });
        
        // Start with just the first data point
        series.setData([formattedData[0]]);
        
        // Ensure chart is properly contained and zoomed in
        chart.timeScale().fitContent();
        
        // Set visible range
        chart.timeScale().setVisibleLogicalRange({
          from: 0,
          to: 10 // Show enough bars to make the chart readable
        });
        
        // Combine historical data (except first point) with future updates
        const combinedUpdates = formattedData.slice(1);
        
        // Create generator for realtime updates
        function* getNextRealtimeUpdate(realtimeData: ChartData[]) {
          for (const dataPoint of realtimeData) {
            yield dataPoint;
          }
          return null;
        }
        
        updateGeneratorRef.current = getNextRealtimeUpdate(combinedUpdates);
        
        // Start interval for updates
        intervalRef.current = setInterval(() => {
          if (updateGeneratorRef.current) {
            const update = updateGeneratorRef.current.next();
            if (update.done) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              return;
            }
            if (seriesRef.current) {
              seriesRef.current.update(update.value);
            }
          }
        }, 1000);
        
        // Handle window resize
        const handleResize = () => {
          if (container && chartRef.current) {
            chartRef.current.applyOptions({ 
              width: container.clientWidth,
              height: 250
            });
            chartRef.current.timeScale().fitContent();
          }
        };
        
        window.addEventListener('resize', handleResize);
        
        setIsLoading(false);
        
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error: any) {
        console.error(`Error creating chart for ${groupName}:`, error);
        setIsLoading(false);
        
        if (container) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'h-full flex items-center justify-center';
          errorDiv.innerHTML = `<div class="text-red-500">Error creating chart: ${error.message || 'Unknown error'}</div>`;
          container.innerHTML = '';
          container.appendChild(errorDiv);
        }
      }
    }
    
    initChart();
  }, [groupName]);
  
  const handleGoToRealtime = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().scrollToRealTime();
    }
  };
  
  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().resetTimeScale();
      chartRef.current.timeScale().fitContent();
    }
  };
  
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">{groupName.replace(/_/g, ' ')}</h2>
        {isLoading ? (
          <div className="h-[250px] flex items-center justify-center">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        ) : (
          <>
            <div ref={chartContainerRef} className="h-[250px] w-full" />
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGoToRealtime}
              >
                Go to realtime
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetZoom}
              >
                Reset Zoom
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Main Multi-Chart Component
export default function MultiChart() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center">MTA Congestion Relief Zone - Real-time Charts</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DETECTION_GROUPS.map((group) => (
          <DetectionGroupChart key={group} groupName={group} />
        ))}
      </div>
    </div>
  );
} 