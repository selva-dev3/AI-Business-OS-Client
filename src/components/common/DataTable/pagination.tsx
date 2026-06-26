import * as React from "react"

interface DataTablePaginationProps {
  totalRows?: number
  pageSize?: number
  currentPage?: number
  onPageChange?: (page: number) => void
}

export function DataTablePagination({
  totalRows = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <p className="text-xs text-muted-foreground">Pagination</p>
    </div>
  )
}
