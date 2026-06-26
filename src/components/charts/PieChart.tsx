import * as React from "react"

interface PieChartProps {
  data: any[]
  dataKey: string
  nameKey: string
  className?: string
}

export function PieChart({ data, dataKey, nameKey, className }: PieChartProps) {
  return (
    <div className={`rounded-md border p-4 ${className}`}>
      <p className="text-sm font-medium">PieChart Component</p>
    </div>
  )
}
