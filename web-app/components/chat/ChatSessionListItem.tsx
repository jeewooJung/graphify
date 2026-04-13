'use client'

import clsx from 'clsx'
import { Badge } from '@/components/ui'
import type { ChatSessionSummary } from '@/types/chat'

type ChatSessionListItemProps = {
  session: ChatSessionSummary
  isActive: boolean
  onClick: () => void
}

function formatRelativeTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export function ChatSessionListItem({ session, isActive, onClick }: ChatSessionListItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={clsx(
          'w-full rounded-2xl border p-3 text-left transition-colors',
          isActive ? 'border-primary-500 bg-primary-50/70' : 'border-border bg-white hover:bg-surface-hover'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="line-clamp-2 text-sm font-medium text-text-primary">{session.title}</p>
          <span className="shrink-0 text-xs text-text-tertiary">{formatRelativeTime(session.lastMessageAt)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant={isActive ? 'primary' : 'default'}>{session.scope.kind}</Badge>
        </div>
      </button>
    </li>
  )
}
