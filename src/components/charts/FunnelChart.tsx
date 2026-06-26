import * as React from "react"

interface FunnelChartProps {
  data: any[]
  dataKey: string
  nameKey: string
  className?: string
}

export function FunnelChart({ data, dataKey, nameKey, className }: FunnelChartProps) {
  return (
    <div className={`rounded-md border p-4 ${className}`}>
      <p className="text-sm font-medium">FunnelChart Component</p>
    </div>
  )
}
