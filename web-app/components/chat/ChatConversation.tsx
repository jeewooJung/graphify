'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui'
import { AnswerCard } from './AnswerCard'
import { ChatMessage } from './ChatMessage'
import type {
  ChatSession,
  CitationRef,
  ConversationMessage,
  NavigationTarget,
} from '@/types/chat'

type ChatConversationProps = {
  session: ChatSession
  messages: ConversationMessage[]
  isStreaming: boolean
  error?: Error
  onSelectCitation: (ref: CitationRef) => void
  onFollowUp: (text: string) => void
  onNavigate: (target: NavigationTarget) => void
}

const STREAMING_LABEL = '\uC751\uB2F5 \uC0DD\uC131 \uC911...'

export function ChatConversation({
  session,
  messages,
  isStreaming,
  error,
  onSelectCitation,
  onFollowUp,
  onNavigate,
}: ChatConversationProps) {
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, isStreaming])

  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      aria-label={`${session.title} conversation`}
    >
      <div className="flex flex-col gap-4 px-4 py-4 md:px-6">
        {messages.map((message) => {
          if (message.role === 'assistant') {
            return (
              <AnswerCard
                key={message.id}
                answer={message}
                messageId={message.id}
                onSelectCitation={onSelectCitation}
                onFollowUpSelect={onFollowUp}
                onNavigate={onNavigate}
              />
            )
          }

          if (message.role === 'system') {
            return (
              <ChatMessage
                key={message.id}
                message={message}
                variant="system"
              />
            )
          }

          return (
            <ChatMessage
              key={message.id}
              message={message}
              variant="user"
            />
          )
        })}

        {isStreaming ? (
          <div className="mx-auto w-full max-w-[720px] rounded-2xl border border-border bg-surface-hover px-4 py-3 text-sm text-text-secondary">
            {STREAMING_LABEL}
          </div>
        ) : null}

        {error ? (
          <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-3 rounded-2xl border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-500">
            <span>{error.message}</span>
            <Button type="button" size="sm" variant="ghost" disabled>
              Retry
            </Button>
          </div>
        ) : null}

        <div ref={scrollAnchorRef} aria-hidden="true" />
      </div>
    </section>
  )
}
