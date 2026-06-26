import * as React from "react"

interface DataTableToolbarProps {
  searchKey?: string
  searchValue?: string
  onSearchChange?: (v: string) => void
}

export function DataTableToolbar({
  searchKey,
  searchValue,
  onSearchChange,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <p className="text-xs text-muted-foreground">Toolbar</p>
    </div>
  )
}
