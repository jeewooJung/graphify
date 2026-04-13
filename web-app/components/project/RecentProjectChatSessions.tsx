'use client'

import { ChatSessionListItem } from '@/components/chat'
import { Button, Card } from '@/components/ui'
import type { ChatSessionSummary } from '@/types/chat'

type RecentProjectChatSessionsProps = {
  sessions: ChatSessionSummary[]
  isLoading: boolean
  onSelect: (id: string) => void
  onStartNew: () => void
}

export function RecentProjectChatSessions({
  sessions,
  isLoading,
  onSelect,
  onStartNew,
}: RecentProjectChatSessionsProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-5">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-text-primary">최근 채팅</h2>
        <button
          type="button"
          onClick={onStartNew}
          className="text-sm font-medium text-primary-700 transition-colors hover:text-primary-800"
        >
          New chat
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 px-6 py-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl border border-border bg-surface-hover" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="space-y-4 px-6 py-8">
          <p className="text-sm text-text-tertiary">아직 이 프로젝트에서 질문한 기록이 없습니다</p>
          <Button type="button" variant="secondary" onClick={onStartNew}>
            Ask this project
          </Button>
        </div>
      ) : (
        <ul className="space-y-3 px-6 py-5">
          {sessions.slice(0, 5).map((session) => (
            <ChatSessionListItem
              key={session.id}
              session={session}
              isActive={false}
              onClick={() => onSelect(session.id)}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
