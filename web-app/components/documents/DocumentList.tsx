'use client'

import { AlertTriangle } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { DocumentListItem } from './DocumentListItem'
import type { DocumentSummary } from '@/types/document'

type DocumentListProps = {
  documents: DocumentSummary[]
  selectedId?: string
  isLoading: boolean
  hasMore: boolean
  error?: Error
  onSelect: (id: string) => void
  onLoadMore: () => void
  onRerun: (id: string) => void
  onDelete: (id: string) => void
  readOnly?: boolean
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <div key={index} className="flex items-start gap-4 border-b border-border px-4 py-4 last:border-b-0">
      <div className="h-10 w-10 animate-pulse rounded-2xl bg-surface-hover" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-48 animate-pulse rounded bg-surface-hover" />
        <div className="h-3 w-64 animate-pulse rounded bg-surface-hover" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-hover" />
      </div>
      <div className="h-8 w-8 animate-pulse rounded-xl bg-surface-hover" />
    </div>
  )
}

export function DocumentList({
  documents,
  selectedId,
  isLoading,
  hasMore,
  error,
  onSelect,
  onLoadMore,
  onRerun,
  onDelete,
  readOnly = false,
}: DocumentListProps) {
  return (
    <Card className="overflow-hidden">
      {error ? (
        <div className="flex items-center justify-between gap-3 border-b border-border bg-error-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-error-500">
            <AlertTriangle size={16} />
            <span>{error.message || 'Failed to load documents.'}</span>
          </div>
          <Button type="button" variant="secondary" size="sm" disabled>
            Retry
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div>{Array.from({ length: 6 }, (_, index) => <SkeletonRow key={index} index={index} />)}</div>
      ) : documents.length ? (
        <div>
          {documents.map((item) => (
            <DocumentListItem
              key={item.id}
              document={item}
              isSelected={item.id === selectedId}
              readOnly={readOnly}
              onSelect={() => onSelect(item.id)}
              onRerun={() => onRerun(item.id)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state min-h-[220px]">No documents found.</div>
      )}

      {hasMore ? (
        <div className="border-t border-border px-4 py-3">
          <Button type="button" variant="secondary" onClick={onLoadMore} disabled={isLoading}>
            Load more
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
