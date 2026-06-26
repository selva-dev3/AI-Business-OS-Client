import * as React from "react"

interface BarChartProps {
  data: any[]
  xAxisKey: string
  dataKeys: string[]
  className?: string
}

export function BarChart({ data, xAxisKey, dataKeys, className }: BarChartProps) {
  return (
    <div className={`rounded-md border p-4 ${className}`}>
      <p className="text-sm font-medium">BarChart Component</p>
    </div>
  )
}
