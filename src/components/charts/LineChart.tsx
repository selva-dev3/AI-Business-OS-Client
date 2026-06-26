import * as React from "react"

interface LineChartProps {
  data: any[]
  xAxisKey: string
  dataKeys: string[]
  className?: string
}

export function LineChart({ data, xAxisKey, dataKeys, className }: LineChartProps) {
  return (
    <div className={`rounded-md border p-4 ${className}`}>
      <p className="text-sm font-medium">LineChart Component</p>
    </div>
  )
}
