import * as React from "react"

interface AvatarProps {
  src?: string
  name: string
  className?: string
}

export function Avatar({ src, name, className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted justify-center items-center font-medium ${className}`}>
      {src ? (
        <img src={src} alt={name} className="aspect-square h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
