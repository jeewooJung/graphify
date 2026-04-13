'use client'

import { Button, Card } from '@/components/ui'
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
  return (
    <Card className="flex h-full min-h-[240px] flex-col p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Chats</h2>
          <p className="text-xs text-text-tertiary">Recent sessions</p>
        </div>
        <Button size="sm" onClick={onCreateSession}>New chat</Button>
      </div>

      {error ? <p className="text-sm text-error-500">{error.message}</p> : null}
      {!error && isLoading ? <p className="text-sm text-text-tertiary">Loading sessions...</p> : null}
      {!error && !isLoading && sessions.length === 0 ? (
        <p className="text-sm text-text-tertiary">No chat sessions yet.</p>
      ) : null}

      {!error && !isLoading && sessions.length > 0 ? (
        <ul className="space-y-2">
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
