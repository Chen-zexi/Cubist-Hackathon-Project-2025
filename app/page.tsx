"use client"

import Dashboard from "@/components/dashboard"
import MultiChart from "@/components/multi-chart"

export default function Home() {
  return (
    <main>
      <Dashboard />
      {/* Testing the charts directly: */}
      <MultiChart />
    </main>
  )
}

