'use client'

import { useState } from 'react'
import { ChatComposer } from './ChatComposer'
import { ChatScopeSelector } from './ChatScopeSelector'
import { SuggestedFollowUps } from './SuggestedFollowUps'
import type {
  ChatAnswerRequest,
  ChatScope,
  ProjectOption,
  ScopeKind,
  SuggestedQuestion,
  TeamOption,
} from '@/types/chat'

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
  const [scope, setScope] = useState<ChatScope>(defaultScope)
  const [draftText, setDraftText] = useState('')

  const handleSubmit = () => {
    const content = draftText.trim()
    if (!content) return

    onSubmit({
      scope,
      content,
    })
  }

  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">
          Graphify Chat
        </h1>
        <p className="text-sm text-text-secondary">
          Ask questions across your workspace, team knowledge, or a specific project.
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
