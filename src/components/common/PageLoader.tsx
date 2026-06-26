import * as React from "react"
import { LoadingSpinner } from "./LoadingSpinner"

export function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}
