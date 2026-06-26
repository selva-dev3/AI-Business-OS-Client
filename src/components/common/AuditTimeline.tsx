import * as React from "react"

interface AuditTimelineProps {
  entityType: string
  entityId: string
  limit?: number
}

export function AuditTimeline({ entityType, entityId, limit = 10 }: AuditTimelineProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold">Audit Timeline for {entityType}</p>
    </div>
  )
}
