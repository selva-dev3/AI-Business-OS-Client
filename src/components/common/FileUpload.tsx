import * as React from "react"

interface UploadedFile {
  id: string
  name: string
  size: number
  url: string
}

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  onUpload: (files: UploadedFile[]) => void
  onRemove?: (fileId: string) => void
  existing?: UploadedFile[]
}

export function FileUpload({
  accept,
  multiple,
  maxSize,
  maxFiles,
  onUpload,
  onRemove,
  existing = [],
}: FileUploadProps) {
  return (
    <div className="border border-dashed rounded-lg p-6 text-center">
      <p className="text-sm text-muted-foreground">Drag and drop your files here</p>
    </div>
  )
}
