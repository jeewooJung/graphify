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
    <Card className="p-4 transition-colors focus-within:border-[rgba(79,110,247,0.35)] focus-within:shadow-[0_0_0_3px_rgba(79,110,247,0.09)]">
      <div className="flex flex-col gap-3">
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          className="min-h-[96px] w-full resize-none rounded-lg border border-transparent bg-transparent px-0 py-0 text-sm leading-6 text-text-primary placeholder:text-text-quaternary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              if (canSubmit) onSubmit()
            }
          }}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-text-quaternary">
            <kbd className="rounded bg-[rgba(17,24,39,0.06)] px-1.5 py-0.5 font-medium">Enter</kbd> to send <span aria-hidden="true">&middot;</span>{' '}
            <kbd className="rounded bg-[rgba(17,24,39,0.06)] px-1.5 py-0.5 font-medium">Shift</kbd> + <kbd className="rounded bg-[rgba(17,24,39,0.06)] px-1.5 py-0.5 font-medium">Enter</kbd> for new line
          </p>
          <Button
            size="md"
            onClick={onSubmit}
            disabled={!canSubmit}
            aria-label="Send message"
            title="Send message"
          >
            {isSubmitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" /> : 'Send'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
