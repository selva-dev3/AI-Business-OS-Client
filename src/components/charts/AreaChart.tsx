import * as React from "react"

interface AreaChartProps {
  data: any[]
  xAxisKey: string
  dataKeys: string[]
  className?: string
}

export function AreaChart({ data, xAxisKey, dataKeys, className }: AreaChartProps) {
  return (
    <div className={`rounded-md border p-4 ${className}`}>
      <p className="text-sm font-medium">AreaChart Component</p>
    </div>
  )
}
