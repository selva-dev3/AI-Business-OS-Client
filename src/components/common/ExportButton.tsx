import * as React from "react"

interface ExportButtonProps {
  onExport?: (format: "csv" | "excel" | "pdf") => void
}

export function ExportButton({ onExport }: ExportButtonProps) {
  return (
    <button
      onClick={() => onExport?.("csv")}
      className="rounded-md border bg-primary px-4 py-2 text-sm text-primary-foreground"
    >
      Export
    </button>
  )
}
