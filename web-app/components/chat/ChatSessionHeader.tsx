'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui'
import type { ChatSession } from '@/types/chat'

type ChatSessionHeaderProps = {
  session: ChatSession
  onRename: (title: string) => void
  readOnly?: boolean
}

export function ChatSessionHeader({ session, onRename, readOnly = false }: ChatSessionHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(session.title)

  useEffect(() => {
    if (!isEditing) setDraftTitle(session.title)
  }, [isEditing, session.title])

  const commit = () => {
    const nextTitle = draftTitle.trim()
    setIsEditing(false)
    if (nextTitle && nextTitle !== session.title) onRename(nextTitle)
  }

  return (
    <div className="space-y-3 border-b border-border pb-4">
      <div className="flex items-center gap-3">
        {isEditing ? (
          <input
            autoFocus
            value={draftTitle}
            className="input-field h-10 text-lg font-semibold"
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit()
              if (event.key === 'Escape') {
                setDraftTitle(session.title)
                setIsEditing(false)
              }
            }}
          />
        ) : (
          <h1
            className="text-xl font-semibold text-text-primary"
            onDoubleClick={() => !readOnly && setIsEditing(true)}
          >
            {session.title}
          </h1>
        )}
        <Badge variant="primary">{session.scope.kind}</Badge>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-tertiary">
        <span>Created by {session.createdBy}</span>
        <span>{new Date(session.createdAt).toLocaleString()}</span>
      </div>
    </div>
  )
}
