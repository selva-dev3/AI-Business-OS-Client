import * as React from "react"

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ComponentType<any>
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border rounded-lg text-center">
      {Icon && <Icon className="w-12 h-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
