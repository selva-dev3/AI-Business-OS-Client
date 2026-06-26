import * as React from "react"

interface DateRangePickerProps {
  onChange?: (range: { from: Date; to: Date }) => void
}

export function DateRangePicker({ onChange }: DateRangePickerProps) {
  return (
    <div className="flex gap-2">
      <input type="date" className="rounded-md border p-2 text-sm" />
      <input type="date" className="rounded-md border p-2 text-sm" />
    </div>
  )
}
