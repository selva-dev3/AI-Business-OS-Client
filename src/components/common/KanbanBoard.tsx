import * as React from "react"

interface KanbanBoardProps {
  columns: any[]
  items: any[]
  onDragEnd?: (result: any) => void
}

export function KanbanBoard({ columns, items, onDragEnd }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      <p className="text-sm font-medium">Kanban Board Component</p>
    </div>
  )
}
