import * as React from "react"

interface RichTextEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  editable?: boolean
  showToolbar?: boolean
  maxLength?: number
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  editable = true,
  showToolbar = true,
}: RichTextEditorProps) {
  return (
    <div className="border rounded-md p-4">
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={!editable}
        className="w-full min-h-[150px] outline-none resize-y text-sm"
      />
    </div>
  )
}
