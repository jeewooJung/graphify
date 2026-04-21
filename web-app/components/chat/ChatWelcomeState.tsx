'use client'

import { useState } from 'react'
import { ChatComposer } from './ChatComposer'
import { ChatScopeSelector } from './ChatScopeSelector'
import { SuggestedFollowUps } from './SuggestedFollowUps'
import { useUser } from '@/lib/auth/user-context'
import type {
  ChatAnswerRequest,
  ChatScope,
  ProjectOption,
  ScopeKind,
  SuggestedQuestion,
  TeamOption,
} from '@/types/chat'

function getGreeting(name?: string) {
  const hour = new Date().getHours()
  const prefix = hour < 5
    ? 'Still up'
    : hour < 12
      ? 'Good morning'
      : hour < 18
        ? 'Good afternoon'
        : 'Good evening'

  return name ? `${prefix}, ${name}` : prefix
}

type ChatWelcomeStateProps = {
  defaultScope: ChatScope
  projects: ProjectOption[]
  teams: TeamOption[]
  disabledKinds?: ScopeKind[]
  suggestions: SuggestedQuestion[]
  isSubmitting: boolean
  error?: Error
  onSubmit: (input: ChatAnswerRequest) => void
}

export function ChatWelcomeState({
  defaultScope,
  projects,
  teams,
  disabledKinds = [],
  suggestions,
  isSubmitting,
  error,
  onSubmit,
}: ChatWelcomeStateProps) {
  const { user } = useUser()
  const [scope, setScope] = useState<ChatScope>(defaultScope)
  const [draftText, setDraftText] = useState('')
  const greeting = getGreeting(user?.name)

  const handleSubmit = () => {
    const content = draftText.trim()
    if (!content) return

    onSubmit({
      scope,
      content,
    })
  }

  return (
    <section className="mx-auto flex w-full max-w-[780px] flex-col gap-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-white/80 px-3 py-1 text-xs font-medium text-text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
          Ready to answer
        </div>
        <h1 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] text-text-primary">
          {greeting}
        </h1>
        <p className="mx-auto max-w-[560px] text-sm text-text-secondary">
          Ask questions across your workspace, team knowledge, or a specific project. Graphify grounds every answer in your own documents.
        </p>
      </div>

      <ChatScopeSelector
        value={scope}
        projects={projects}
        teams={teams}
        disabledKinds={disabledKinds}
        onChange={setScope}
      />

      <div className="space-y-3">
        <ChatComposer
          value={draftText}
          isSubmitting={isSubmitting}
          onChange={setDraftText}
          onSubmit={handleSubmit}
        />

        {error ? (
          <p
            role="alert"
            className="rounded-2xl border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-500"
          >
            {error.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-tertiary">
          Suggested questions
        </p>
        <SuggestedFollowUps
          items={suggestions}
          onSelect={setDraftText}
        />
      </div>
    </section>
  )
}
