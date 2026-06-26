import * as React from "react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label: string
    type: "up" | "down" | "neutral"
  }
  className?: string
}

export function StatsCard({ title, value, description, trend, className }: StatsCardProps) {
  return (
    <div className={`rounded-lg border bg-card p-6 text-card-foreground shadow-sm ${className}`}>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
      </div>
      {trend && (
        <p className="mt-1 text-xs text-muted-foreground">
          <span className={trend.type === "up" ? "text-emerald-600" : trend.type === "down" ? "text-rose-600" : ""}>
            {trend.value}%
          </span>{" "}
          {trend.label}
        </p>
      )}
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
