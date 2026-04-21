'use client'

import clsx from 'clsx'
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
          'relative w-full cursor-pointer rounded-lg border px-2.5 py-2 text-left transition-colors',
          isActive
            ? 'border-[rgba(79,110,247,0.2)] bg-primary-soft'
            : 'border-[var(--border-subtle)] bg-white/60 hover:border-[var(--border-strong)] hover:bg-white'
        )}
      >
        {isActive && (
          <span
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary-500"
            aria-hidden="true"
          />
        )}
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-[13px] font-medium text-text-primary">{session.title}</p>
          <span className="shrink-0 text-[10px] text-text-tertiary">{formatRelativeTime(session.lastMessageAt)}</span>
        </div>
      </button>
    </li>
  )
}
