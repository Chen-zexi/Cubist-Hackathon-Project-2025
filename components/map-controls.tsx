"use client"

import { Button } from "@/components/ui/button"
import { Map, Layers, ZoomIn, ZoomOut, RotateCcw, Compass } from "lucide-react"

export default function MapControls({ onViewChange, currentView }) {
  return (
    <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md p-2 rounded-lg border border-gray-700/70">
      <Button
        variant={currentView === "3d" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("3d")}
        className={currentView !== "3d" ? "bg-black/60 border-gray-600 hover:bg-black/80 text-white" : ""}
      >
        <Map className="h-4 w-4 mr-2" />
        3D View
      </Button>
      <Button
        variant={currentView === "heatmap" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("heatmap")}
        className={currentView !== "heatmap" ? "bg-black/60 border-gray-600 hover:bg-black/80 text-white" : ""}
      >
        <Layers className="h-4 w-4 mr-2" />
        Heatmap
      </Button>
      <div className="h-6 w-px bg-gray-600"></div>
      <Button variant="outline" size="icon" className="bg-black/60 border-gray-600 hover:bg-black/80 text-white">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" className="bg-black/60 border-gray-600 hover:bg-black/80 text-white">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" className="bg-black/60 border-gray-600 hover:bg-black/80 text-white">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" className="bg-black/60 border-gray-600 hover:bg-black/80 text-white">
        <Compass className="h-4 w-4" />
      </Button>
    </div>
  )
}

