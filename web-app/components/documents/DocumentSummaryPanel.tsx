'use client'

import clsx from 'clsx'
import { MessageSquareText } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { DocumentChunk, DocumentDetail } from '@/types/document'

type DocumentSummaryPanelProps = {
  document?: DocumentDetail
  chunksPreview: DocumentChunk[]
  highlightChunkId?: string
  isLoading: boolean
  error?: Error
  onOpenChat: (documentId: string) => void
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
  const value = size / 1024 ** index
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">{label}</p>
      <p className="text-sm text-text-primary">{value}</p>
    </div>
  )
}

export function DocumentSummaryPanel({
  document,
  chunksPreview,
  highlightChunkId,
  isLoading,
  error,
  onOpenChat,
}: DocumentSummaryPanelProps) {
  if (isLoading) return <Card className="empty-state min-h-[420px]">Loading document summary...</Card>
  if (error) return <Card className="empty-state min-h-[420px]">{error.message}</Card>
  if (!document) return <Card className="empty-state min-h-[420px]">\uBB38\uC11C\uB97C \uC120\uD0DD\uD558\uC138\uC694</Card>

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle>{document.title}</CardTitle>
          <p className="text-sm leading-6 text-text-secondary">{document.summary || 'No summary available yet.'}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <PreviewRow label="Filename" value={document.originalFilename} />
          <PreviewRow label="File size" value={formatFileSize(document.fileSize)} />
          <PreviewRow label="Uploaded by" value={document.uploadedBy} />
          <PreviewRow label="Uploaded at" value={new Date(document.uploadedAt).toLocaleString()} />
          <PreviewRow label="Source type" value={document.sourceType} />
          <PreviewRow label="Chunk count" value={String(document.chunkCount)} />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">Last analysis log</p>
          <pre className="overflow-x-auto rounded-2xl border border-border bg-surface-hover px-4 py-3 text-xs leading-6 text-text-secondary">
            {document.lastAnalysisLog || 'No analysis log available.'}
          </pre>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">Chunk preview</p>
          <div className="space-y-3">
            {chunksPreview.length ? chunksPreview.map((chunk) => (
              <div
                key={chunk.id}
                className={clsx(
                  'rounded-2xl border px-4 py-3',
                  chunk.id === highlightChunkId
                    ? 'border-primary-500/40 bg-primary-500/6'
                    : 'border-border bg-white'
                )}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                  <span>{chunk.pageNumber ? `Page ${chunk.pageNumber}` : `Chunk ${chunk.chunkIndex + 1}`}</span>
                  {chunk.sectionTitle ? <span>&middot; {chunk.sectionTitle}</span> : null}
                </div>
                <p className="line-clamp-3 text-sm leading-6 text-text-secondary">{chunk.content}</p>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-text-tertiary">
                No chunks available yet.
              </div>
            )}
          </div>
        </div>

        <Button type="button" onClick={() => onOpenChat(document.id)}>
          <MessageSquareText size={16} />
          Ask about this document
        </Button>
      </CardContent>
    </Card>
  )
}
