"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useState } from "react"

export default function TimeSelector({ value, onChange }) {
  const [date, setDate] = useState(new Date())

  return (
    <div className="flex items-center space-x-2">
      <div className="flex bg-black/60 backdrop-blur-md rounded-md p-1 border border-gray-800/50">
        <Button
          variant={value === "24h" ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange("24h")}
          className={value !== "24h" ? "text-gray-300 hover:text-white" : ""}
        >
          24h
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
          30d
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

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="bg-black/60 backdrop-blur-md border-gray-800/50">
            <Calendar className="h-4 w-4 mr-2" />
            Custom
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-black/90 backdrop-blur-md border-gray-700 text-white">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={(date) => {
              setDate(date)
              onChange("custom")
            }}
            initialFocus
            className="bg-transparent calendar-light"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

