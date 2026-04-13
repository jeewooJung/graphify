'use client'

import clsx from 'clsx'
import { Button, Card } from '@/components/ui'
import type { CitationNavigation, CitationPreview, CitationRef } from '@/types/chat'
import { SourcePreviewCard } from './SourcePreviewCard'

type SourcePanelProps = {
  selection?: CitationRef
  previews: CitationPreview[]
  isLoading: boolean
  error?: Error
  onClose: () => void
  onOpenDocument: (nav: CitationNavigation) => void
}

export function SourcePanel({
  selection,
  previews,
  isLoading,
  error,
  onClose,
  onOpenDocument,
}: SourcePanelProps) {
  return (
    <Card className="flex h-full min-h-[240px] flex-col p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Sources</h2>
          <p className="text-xs text-text-tertiary">Citation previews</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>

      {error ? <p className="text-sm text-error-500">{error.message}</p> : null}
      {!error && isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl border border-border bg-surface-hover" />)}
        </div>
      ) : null}
      {!error && !isLoading && previews.length === 0 ? <p className="text-sm text-text-tertiary">No source selected.</p> : null}

      {!error && !isLoading && previews.length > 0 ? (
        <div className="space-y-3 overflow-y-auto">
          {previews.map((preview) => (
            <div
              key={preview.id}
              className={clsx(selection?.citationId === preview.id && 'rounded-2xl ring-2 ring-primary-500/30')}
            >
              <SourcePreviewCard preview={preview} onOpenDocument={onOpenDocument} />
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  )
}
