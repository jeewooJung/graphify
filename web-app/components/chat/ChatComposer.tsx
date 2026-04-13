'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button, Card } from '@/components/ui'

type ChatComposerProps = {
  value: string
  placeholder?: string
  isSubmitting: boolean
  disabled?: boolean
  onChange: (v: string) => void
  onSubmit: () => void
}

export function ChatComposer({
  value,
  placeholder = 'Ask Graphify a question...',
  isSubmitting,
  disabled = false,
  onChange,
  onSubmit,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [rows, setRows] = useState(1)
  const canSubmit = value.trim().length > 0 && !disabled && !isSubmitting

  useEffect(() => {
    const element = textareaRef.current
    if (!element) return
    element.style.height = 'auto'
    const lineHeight = 24
    const maxHeight = lineHeight * 8
    element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`
    setRows(Math.min(8, Math.max(1, Math.ceil(element.scrollHeight / lineHeight))))
  }, [value])

  return (
    <Card className="p-3">
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          className="input-field min-h-[44px] resize-none py-2.5"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              if (canSubmit) onSubmit()
            }
          }}
        />
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={!canSubmit}
          aria-label="Send message"
          title="Send message"
        >
          {isSubmitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" /> : 'Send'}
        </Button>
      </div>
    </Card>
  )
}
