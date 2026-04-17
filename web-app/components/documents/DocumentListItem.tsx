'use client'

import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import {
  Eye, File, FileCode2, FileText, MoreVertical, RotateCcw, Trash2,
} from 'lucide-react'
import { DocumentStatusBadge } from './DocumentStatusBadge'
import type { DocumentSummary } from '@/types/document'

type DocumentListItemProps = {
  document: DocumentSummary
  isSelected: boolean
  readOnly?: boolean
  onSelect: () => void
  onRerun: () => void
  onDelete: () => void
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
  const value = size / 1024 ** index
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`
}

function formatRelativeTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const deltaMs = date.getTime() - Date.now()
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const divisions = [
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ] as const

  for (const [unit, ms] of divisions) {
    const amount = Math.round(deltaMs / ms)
    if (Math.abs(amount) >= 1) return formatter.format(amount, unit)
  }

  return 'just now'
}

function renderFileIcon(mimeType: string) {
  if (mimeType.includes('markdown')) return <FileCode2 size={18} />
  if (mimeType.includes('pdf') || mimeType.includes('text') || mimeType.includes('word')) return <FileText size={18} />
  return <File size={18} />
}

export function DocumentListItem({
  document: item,
  isSelected,
  readOnly = false,
  onSelect,
  onRerun,
  onDelete,
}: DocumentListItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false)
    }

    window.document.addEventListener('mousedown', handlePointerDown)
    return () => window.document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div
      data-document-id={item.id}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      className={clsx(
        'relative flex w-full items-start gap-4 border-b border-border px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-surface-hover',
        isSelected && 'bg-primary-500/6'
      )}
    >
      <span className={clsx('absolute inset-y-3 left-0 w-1 rounded-r-full', isSelected && 'bg-primary-500')} />
      <div className="mt-0.5 rounded-2xl border border-border bg-white p-2 text-text-tertiary">{renderFileIcon(item.mimeType)}</div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-1">
          <p className="truncate text-sm font-semibold text-text-primary">{item.title}</p>
          <p className="truncate text-xs text-text-tertiary">{item.originalFilename}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="app-chip">{formatFileSize(item.fileSize)}</span>
          {item.tags.map((tag) => (
            <span key={tag} className="app-chip">{tag}</span>
          ))}
        </div>
        {item.summary ? (
          <p className="line-clamp-2 text-sm leading-6 text-text-secondary">{item.summary}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-start gap-3">
        <div className="pt-1 text-right">
          <DocumentStatusBadge status={item.status} progressPct={item.progressPct} />
          <p className="mt-2 text-xs font-medium text-text-tertiary">{formatRelativeTime(item.uploadedAt)}</p>
          <p className="mt-1 text-xs text-text-quaternary">{item.uploadedBy}</p>
        </div>
        {!readOnly ? (
          <div ref={menuRef} className="relative" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              aria-label="Open document actions"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen ? (
              <div className="absolute right-0 top-11 z-10 w-40 rounded-2xl border border-border bg-white p-2 shadow-card">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-hover"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onSelect()
                  }}
                >
                  <Eye size={15} />
                  Preview
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-hover"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onRerun()
                  }}
                >
                  <RotateCcw size={15} />
                  Re-run
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-error-500 transition-colors hover:bg-error-50"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onDelete()
                  }}
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
