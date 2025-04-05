"use client"

import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Dataset range constants
const DATA_START_DATE = new Date("2025-01-05")
const DATA_END_DATE = new Date("2025-03-29")

interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TimeSelector({ value, onChange }: TimeSelectorProps) {
  // Calculate time ranges based on available data
  const fullRange = "Jan 5 - Mar 29"
  const lastMonth = "Mar 1 - Mar 29"
  const lastWeek = "Mar 23 - Mar 29"
  const lastDay = "Mar 29"

  return (
    <div className="flex items-center justify-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Info className="h-4 w-4 text-gray-400 mr-2" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-black/90 text-white border-gray-700">
            <p>Data available from Jan 5 to Mar 29, 2025 only</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="flex bg-black/60 backdrop-blur-md rounded-md p-1 border border-gray-800/50">
        <Button
          variant={value === "24h" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange("24h")}
          className={value !== "24h" ? "text-gray-300 hover:text-white" : ""}
        >
          1d
        </Button>
        <Button
          variant={value === "7d" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange("7d")}
          className={value !== "7d" ? "text-gray-300 hover:text-white" : ""}
        >
          7d
        </Button>
        <Button
          variant={value === "30d" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange("30d")}
          className={value !== "30d" ? "text-gray-300 hover:text-white" : ""}
        >
          1m
        </Button>
        <Button
          variant={value === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange("all")}
          className={value !== "all" ? "text-gray-300 hover:text-white" : ""}
        >
          All
        </Button>
      </div>
    </div>
  )
}

