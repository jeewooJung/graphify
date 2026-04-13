'use client'

import { AlertCircle, Info, Shield } from 'lucide-react'
import type { SystemMessage, UserMessage } from '@/types/chat'

type ChatMessageProps = {
  message: UserMessage | SystemMessage
  variant: 'user' | 'system'
}

const SYSTEM_STYLES = {
  insufficient_evidence: {
    icon: AlertCircle,
    className: 'border-warning-500/30 bg-warning-500/10 text-text-primary',
  },
  permission_warning: {
    icon: Shield,
    className: 'border-error-500/25 bg-error-500/10 text-text-primary',
  },
  info: {
    icon: Info,
    className: 'border-border bg-surface-hover text-text-primary',
  },
}

export function ChatMessage({ message, variant }: ChatMessageProps) {
  if (variant === 'user' && message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-3xl bg-primary-500 px-4 py-3 text-sm text-white">
          {message.content}
        </div>
      </div>
    )
  }

  if (variant === 'system' && message.role === 'system') {
    const tone = SYSTEM_STYLES[message.variant]
    const Icon = tone.icon
    return (
      <div className="flex justify-center">
        <div className={`flex max-w-[720px] items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${tone.className}`}>
          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{message.content}</p>
        </div>
      </div>
    )
  }

  return null
}
