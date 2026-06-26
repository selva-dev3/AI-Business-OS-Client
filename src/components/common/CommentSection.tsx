import * as React from "react"

interface CommentSectionProps {
  entityType: string
  entityId: string
}

export function CommentSection({ entityType, entityId }: CommentSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold">Comments</h3>
    </div>
  )
}
