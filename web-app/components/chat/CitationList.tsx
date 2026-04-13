'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import type { Citation, CitationRef } from '@/types/chat'

// Refined with messageId so the component can emit a complete CitationRef.
type CitationListProps = {
  citations: Citation[]
  messageId: string
  onSelect: (ref: CitationRef) => void
  maxVisible?: number
}

export function CitationList({
  citations,
  messageId,
  onSelect,
  maxVisible = 3,
}: CitationListProps) {
  const [expanded, setExpanded] = useState(false)
  const visibleCitations = expanded ? citations : citations.slice(0, maxVisible)

  return (
    <div className="flex flex-wrap gap-2">
      {visibleCitations.map((citation) => (
        <Button
          key={citation.id}
          type="button"
          size="sm"
          variant="secondary"
          className="max-w-full rounded-full"
          onClick={() => onSelect({ messageId, citationId: citation.id })}
        >
          <span className="truncate">
            {citation.documentTitle}
            {citation.pageNumber ? ` · p.${citation.pageNumber}` : ''}
          </span>
        </Button>
      ))}
      {citations.length > maxVisible ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-full"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Show less' : `${citations.length - maxVisible} more`}
        </Button>
      ) : null}
    </div>
  )
}
