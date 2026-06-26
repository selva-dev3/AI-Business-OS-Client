import * as React from "react"

interface ActivityFeedProps {
  activities?: any[]
}

export function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Activity Feed</p>
    </div>
  )
}
