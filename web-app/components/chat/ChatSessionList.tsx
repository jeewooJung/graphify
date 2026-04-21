'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { PanelLeftClose, PanelLeftOpen, Plus } from 'lucide-react'
import { Card } from '@/components/ui'
import type { ChatSessionSummary } from '@/types/chat'
import { ChatSessionListItem } from './ChatSessionListItem'

type ChatSessionListProps = {
  sessions: ChatSessionSummary[]
  activeSessionId?: string
  isLoading: boolean
  error?: Error
  onCreateSession: () => void
  onSelect: (id: string) => void
}

export function ChatSessionList({
  sessions,
  activeSessionId,
  isLoading,
  error,
  onCreateSession,
  onSelect,
}: ChatSessionListProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = window.localStorage.getItem('graphify:chat:sessions-collapsed')
      if (stored !== null) {
        setIsCollapsed(stored === 'true')
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem('graphify:chat:sessions-collapsed', String(isCollapsed))
    } catch {
      // ignore storage errors
    }
  }, [isCollapsed])

  if (isCollapsed) {
    return (
      <Card className="flex h-full w-14 flex-col items-center gap-1 p-2 transition-all duration-200">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          aria-label="Expand sessions"
          title="Expand sessions"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <PanelLeftOpen size={16} />
        </button>
        <button
          type="button"
          onClick={onCreateSession}
          aria-label="New chat"
          title="New chat"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-primary-soft text-primary-700 transition-colors hover:bg-[rgba(79,110,247,0.18)]"
        >
          <Plus size={16} />
        </button>
        <div className="my-1 h-px w-8 bg-[var(--border-subtle)]" />
        {!error && !isLoading && sessions.length > 0 && (
          <ul className="flex w-full flex-col items-center gap-1 overflow-y-auto pr-0.5">
            {sessions.slice(0, 12).map((session) => {
              const isActive = session.id === activeSessionId
              const initial = session.title.trim().slice(0, 1).toUpperCase() || '?'
              return (
                <li key={session.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(session.id)}
                    aria-label={session.title}
                    title={session.title}
                    className={clsx(
                      'flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-xs font-semibold transition-colors',
                      isActive
                        ? 'bg-primary-soft text-primary-700 ring-1 ring-[rgba(79,110,247,0.35)]'
                        : 'bg-[rgba(17,24,39,0.04)] text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    )}
                  >
                    {initial}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {!error && isLoading && (
          <div className="mt-2 flex flex-col items-center gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="h-9 w-9 animate-pulse rounded-lg bg-[rgba(17,24,39,0.06)]" />
            ))}
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card className="flex h-full w-[240px] flex-col p-3 transition-all duration-200">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text-primary">Chats</h2>
          {sessions.length > 0 && (
            <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[rgba(17,24,39,0.05)] px-1.5 text-[10px] font-semibold text-text-tertiary">
              {sessions.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onCreateSession}
            aria-label="New chat"
            title="New chat"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            aria-label="Collapse sessions"
            title="Collapse sessions"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>
      </header>

      {error ? <p className="text-sm text-error-500">{error.message}</p> : null}
      {!error && isLoading ? <p className="text-sm text-text-tertiary">Loading sessions...</p> : null}
      {!error && !isLoading && sessions.length === 0 ? (
        <p className="text-sm text-text-tertiary">No chat sessions yet.</p>
      ) : null}

      {!error && !isLoading && sessions.length > 0 ? (
        <ul className="space-y-1.5 overflow-y-auto pr-0.5">
          {sessions.map((session) => (
            <ChatSessionListItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onClick={() => onSelect(session.id)}
            />
          ))}
        </ul>
      ) : null}
    </Card>
  )
}
