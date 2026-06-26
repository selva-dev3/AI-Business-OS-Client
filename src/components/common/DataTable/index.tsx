import * as React from "react"

interface DataTableProps<T> {
  data: T[]
  columns: any[]
  isLoading?: boolean
  totalRows?: number
  pagination?: any
  onPaginationChange?: (p: any) => void
  searchKey?: string
  searchValue?: string
  onSearchChange?: (v: string) => void
  filters?: any[]
  onFiltersChange?: (f: any[]) => void
  bulkActions?: any[]
  onRowClick?: (row: T) => void
  exportConfig?: any
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  totalRows,
  pagination,
  onPaginationChange,
  searchKey,
  searchValue,
  onSearchChange,
  filters,
  onFiltersChange,
  bulkActions,
  onRowClick,
  exportConfig,
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border p-4">
      <p className="text-sm font-medium">DataTable Component</p>
    </div>
  )
}
