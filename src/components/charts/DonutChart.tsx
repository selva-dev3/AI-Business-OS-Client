import * as React from "react"

interface DonutChartProps {
  data: any[]
  dataKey: string
  nameKey: string
  className?: string
}

export function DonutChart({ data, dataKey, nameKey, className }: DonutChartProps) {
  return (
    <div className={`rounded-md border p-4 ${className}`}>
      <p className="text-sm font-medium">DonutChart Component</p>
    </div>
  )
}
