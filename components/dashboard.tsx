"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  BarChart3,
  Map,
  ArrowUpRight,
  ArrowDownRight,
  Car,
  Maximize2,
  Minimize2,
  Layers,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { NYCMap } from "./nyc-map.jsx";
import TrafficFlowChart from "./traffic-flow-chart";
import VehicleTypeDistribution from "./vehicle-type-distribution";
import TimeSelector from "./time-selector";
import MapControls from "./map-controls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
import VanillaDataView from "./vanilla-data-view";
import RealTimeChartsPage from "./real-time-charts";

// Define interfaces for component props
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: ReactNode;
}

interface EntryPointProps {
  name: string;
  count: number;
  change: string;
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("24h");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [mapView, setMapView] = useState("3d");
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D Map Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <NYCMap showUI={isExpanded}/>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-black/50 backdrop-blur-sm border-gray-700 hover:bg-black/70"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* UI Overlay */}
      {showUI && (
        <div
          className={`absolute inset-0 z-10 transition-all duration-300 ease-in-out ${
            isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {/* Header */}
          <header className="bg-black/40 backdrop-blur-md border-b border-gray-800/50 sticky top-0 z-20">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 w-fit">
                <BarChart3 className="h-6 w-6 text-emerald-500" />
                <h1 className="text-xl font-bold text-white">
                  MTA Congestion Pricing
                </h1>
              </div>
              <div className="flex-1 flex justify-center">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-[400px]"
                >
                  <TabsList className="bg-black/50 border border-gray-800/50">
                    <TabsTrigger
                      value="dashboard"
                      className="data-[state=active]:bg-emerald-500/20"
                    >
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger
                      value="charts"
                      className="data-[state=active]:bg-emerald-500/20 flex items-center"
                    >
                      Real-time Charts
                    </TabsTrigger>
                    <TabsTrigger
                      value="data"
                      className="data-[state=active]:bg-emerald-500/20"
                    >
                      Predict Current Traffic
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="w-[200px] flex justify-end">
                <TimeSelector value={timeRange} onChange={setTimeRange} />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-6 overflow-auto h-[calc(100vh-64px)]">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="dashboard">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                  <MetricCard
                    title="Current Traffic Volume"
                    value="12,453"
                    change="+5.2%"
                    isPositive={false}
                    icon={<Car className="h-5 w-5 text-emerald-500" />}
                  />
                  <MetricCard
                    title="Congestion Reduction"
                    value="23.4%"
                    change="+3.2%"
                    isPositive={true}
                    icon={
                      <ArrowDownRight className="h-5 w-5 text-emerald-500" />
                    }
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-black/40 backdrop-blur-md border-gray-800/50 lg:col-span-2">
                    <div className="p-4 border-b border-gray-800/50">
                      <h2 className="font-semibold text-white">
                        Traffic Flow Over Time
                      </h2>
                    </div>
                    <CardContent className="p-4 h-[300px]">
                      <TrafficFlowChart timeRange={timeRange} />
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-md border-gray-800/50">
                    <div className="p-4 border-b border-gray-800/50">
                      <h2 className="font-semibold text-white">
                        Vehicle Distribution
                      </h2>
                    </div>
                    <CardContent className="p-4 h-[300px]">
                      <VehicleTypeDistribution />
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-md border-gray-800/50 lg:col-span-2">
                    <div className="p-4 border-b border-gray-800/50">
                      <h2 className="font-semibold text-white">
                        Zone Entry Points
                      </h2>
                    </div>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EntryPoint
                          name="Midtown Tunnel"
                          count={3245}
                          change="+12%"
                        />
                        <EntryPoint
                          name="Brooklyn Bridge"
                          count={2876}
                          change="-5%"
                        />
                        <EntryPoint
                          name="Holland Tunnel"
                          count={1987}
                          change="+8%"
                        />
                        <EntryPoint
                          name="59th St Bridge"
                          count={2345}
                          change="+2%"
                        />
                        <EntryPoint
                          name="Lincoln Tunnel"
                          count={3102}
                          change="+15%"
                        />
                        <EntryPoint
                          name="Queens Midtown"
                          count={2756}
                          change="+7%"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="charts">
                <Card className="bg-black/40 backdrop-blur-md border-gray-800/50 h-[calc(100vh-200px)] overflow-auto">
                  <div className="p-4 border-b border-gray-800/50">
                    <h2 className="font-semibold text-white">
                      Real-time Charts
                    </h2>
                  </div>
                  <CardContent className="p-0 h-full">
                <RealTimeChartsPage/>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data">
                <Card className="bg-black/40 backdrop-blur-md border-gray-800/50 h-[calc(100vh-200px)]">
                  <div className="p-4 border-b border-gray-800/50">
                    <h2 className="font-semibold text-white">
                      Predict Current Traffic
                    </h2>
                  </div>
                  <CardContent className="p-0 h-full">
                    <VanillaDataView />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {/* Minimized UI Toggle Button (only visible when UI is hidden) */}
      {!showUI && (
        <Button
          variant="outline"
          className="absolute bottom-4 left-4 z-30 bg-black/50 backdrop-blur-sm border-gray-700 hover:bg-black/70"
          onClick={() => setShowUI(true)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Show Dashboard
        </Button>
      )}

      {/* Expanded Mode Exit Button */}
      {isExpanded && (
        <Button
          variant="outline"
          className="absolute top-4 left-4 z-30 bg-black/50 backdrop-blur-sm border-gray-700 hover:bg-black/70"
          onClick={() => setIsExpanded(false)}
        >
          <Minimize2 className="h-4 w-4 mr-2" />
          Exit Fullscreen
        </Button>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon,
}: MetricCardProps) {
  return (
    <Card className="bg-black/40 backdrop-blur-md border-gray-800/50">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-100">{title}</p>
            <p className="text-2xl font-bold mt-1 text-white">{value}</p>
          </div>
          <div className="p-2 rounded-full bg-gray-800/70">{icon}</div>
        </div>
        <div
          className={`mt-2 text-sm font-medium ${
            isPositive ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {change}
        </div>
      </CardContent>
    </Card>
  );
}

function EntryPoint({ name, count, change }: EntryPointProps) {
  const isPositive = change.startsWith("+");

  return (
    <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-md">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        <span className="text-white font-medium">{name}</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="font-medium text-white">{count}</span>
        <span
          className={`text-sm font-medium ${
            isPositive ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
}