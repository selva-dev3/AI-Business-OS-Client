import * as React from "react"

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
}

export function SearchBar({ placeholder = "Search...", value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm"
      />
    </div>
  )
}
