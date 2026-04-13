'use client'

import { Card } from '@/components/ui'
import { DocumentListItem } from '@/components/documents'
import type { DocumentSummary } from '@/types/document'

type RecentProjectUploadsProps = {
  documents: DocumentSummary[]
  isLoading: boolean
  onSelect: (doc: DocumentSummary) => void
  onOpenAll: () => void
}

const noop = () => {}

export function RecentProjectUploads({
  documents,
  isLoading,
  onSelect,
  onOpenAll,
}: RecentProjectUploadsProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-5">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-text-primary">최근 업로드</h2>
        <button
          type="button"
          onClick={onOpenAll}
          className="text-sm font-medium text-primary-700 transition-colors hover:text-primary-800"
        >
          Open documents
        </button>
      </div>

      {isLoading ? (
        <div className="px-6 py-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 border-b border-border py-4 last:border-b-0">
              <div className="h-10 w-10 animate-pulse rounded-2xl bg-surface-hover" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-56 animate-pulse rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <p className="px-6 py-8 text-sm text-text-tertiary">아직 업로드된 문서가 없습니다</p>
      ) : (
        <div>
          {documents.slice(0, 5).map((document) => (
            <DocumentListItem
              key={document.id}
              document={document}
              isSelected={false}
              readOnly
              onSelect={() => onSelect(document)}
              onRerun={noop}
              onDelete={noop}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
