'use client'

import { Button, Card } from '@/components/ui'
import type { CitationNavigation, CitationPreview } from '@/types/chat'

type SourcePreviewCardProps = {
  preview: CitationPreview
  onOpenDocument: (nav: CitationNavigation) => void
}

export function SourcePreviewCard({ preview, onOpenDocument }: SourcePreviewCardProps) {
  const snippet = preview.surroundingText ?? preview.quoteText

  return (
    <Card className="p-4">
      <article className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{preview.documentTitle}</h3>
          <p className="text-xs text-text-tertiary">{preview.projectName}</p>
        </div>
        <p className="text-xs text-text-tertiary">
          {preview.sectionTitle ? `${preview.sectionTitle} · ` : ''}
          {preview.pageNumber ? `p.${preview.pageNumber}` : 'Page unavailable'}
        </p>
        <blockquote className="rounded-2xl bg-surface-hover px-3 py-3 text-sm text-text-secondary">
          {snippet}
        </blockquote>
        <Button
          size="sm"
          onClick={() => onOpenDocument({ projectId: preview.projectId, documentId: preview.documentId, chunkId: preview.chunkId })}
        >
          문서 열기
        </Button>
      </article>
    </Card>
  )
}
