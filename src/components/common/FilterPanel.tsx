import * as React from "react"

interface FilterPanelProps {
  filters?: any[]
  onChange?: (filters: any[]) => void
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="rounded-md border p-4">
      <p className="text-sm font-medium">Filter Panel</p>
    </div>
  )
}
