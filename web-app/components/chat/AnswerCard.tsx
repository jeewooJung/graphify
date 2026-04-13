'use client'

import { useState } from 'react'
import { Badge, Button, Card } from '@/components/ui'
import { CitationList } from './CitationList'
import { SuggestedFollowUps } from './SuggestedFollowUps'
import type {
  AssistantAnswer,
  CitationRef,
  NavigationTarget,
} from '@/types/chat'

type AnswerCardProps = {
  answer: AssistantAnswer
  messageId: string
  onSelectCitation: (ref: CitationRef) => void
  onFollowUpSelect: (text: string) => void
  onNavigate: (target: NavigationTarget) => void
}

const COLLAPSE_THRESHOLD = 1200
const OPEN_DOCUMENT_LABEL = '\uBB38\uC11C \uC5F4\uAE30'
const GO_TO_SEARCH_LABEL = '\uAC80\uC0C9\uC73C\uB85C \uC774\uB3D9'
const VIEW_IN_GRAPH_LABEL = '\uADF8\uB798\uD504\uC5D0\uC11C \uBCF4\uAE30'

function formatRelativeTime(value: string) {
  const date = new Date(value)
  const deltaMs = date.getTime() - Date.now()

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const divisions = [
    { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: 'day', ms: 1000 * 60 * 60 * 24 },
    { unit: 'hour', ms: 1000 * 60 * 60 },
    { unit: 'minute', ms: 1000 * 60 },
  ] as const

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  for (const division of divisions) {
    const amount = Math.round(deltaMs / division.ms)
    if (Math.abs(amount) >= 1) {
      return formatter.format(amount, division.unit)
    }
  }

  return 'just now'
}

function getConfidenceVariant(confidence: number) {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.5) return 'warning'
  return 'error'
}

export function AnswerCard({
  answer,
  messageId,
  onSelectCitation,
  onFollowUpSelect,
  onNavigate,
}: AnswerCardProps) {
  const [expanded, setExpanded] = useState(false)
  const shouldCollapse = answer.content.length > COLLAPSE_THRESHOLD
  const visibleContent = shouldCollapse && !expanded
    ? `${answer.content.slice(0, COLLAPSE_THRESHOLD).trimEnd()}...`
    : answer.content
  const paragraphs = visibleContent.split(/\r?\n\s*\r?\n/).filter(Boolean)
  const firstCitation = answer.citations[0]
  const searchQuery = answer.content.trim().slice(0, 80)

  return (
    <Card className="mx-auto w-full max-w-[720px] p-5">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
          <span className="font-medium text-text-primary">{answer.modelName}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{formatRelativeTime(answer.createdAt)}</span>
          {typeof answer.confidence === 'number' ? (
            <>
              <span aria-hidden="true">&middot;</span>
              <Badge variant={getConfidenceVariant(answer.confidence)}>
                {`${Math.round(answer.confidence * 100)}% confidence`}
              </Badge>
            </>
          ) : null}
          <span aria-hidden="true">&middot;</span>
          <span>{`used ${answer.citations.length} docs`}</span>
        </div>

        <div className="space-y-3 text-sm text-text-primary">
          {paragraphs.map((paragraph, index) => (
            <p key={`${answer.id}-paragraph-${index}`} className="whitespace-pre-wrap leading-7">
              {paragraph}
            </p>
          ))}
          {shouldCollapse ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="px-0 text-text-secondary"
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? 'less' : 'more'}
            </Button>
          ) : null}
        </div>

        <CitationList
          citations={answer.citations}
          messageId={messageId}
          onSelect={onSelectCitation}
        />

        <SuggestedFollowUps
          items={answer.suggestedFollowUps}
          onSelect={onFollowUpSelect}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (!firstCitation) return

              onNavigate({
                kind: 'document',
                payload: {
                  projectId: firstCitation.projectId,
                  documentId: firstCitation.documentId,
                  chunkId: firstCitation.chunkId,
                },
              })
            }}
            disabled={!firstCitation}
          >
            {OPEN_DOCUMENT_LABEL}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onNavigate({ kind: 'search', payload: { query: searchQuery } })}
          >
            {GO_TO_SEARCH_LABEL}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onNavigate({ kind: 'graph', payload: { nodeId: answer.id } })}
          >
            {VIEW_IN_GRAPH_LABEL}
          </Button>
        </div>
      </div>
    </Card>
  )
}
