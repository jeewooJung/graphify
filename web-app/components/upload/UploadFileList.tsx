'use client'

import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui'
import type { FileCandidate } from '@/types/document'
import { formatBytes } from './uploadUtils'

type UploadFileListProps = {
  files: FileCandidate[]
  onRemove: (id: string) => void
  readOnly?: boolean
}

export function UploadFileList({
  files,
  onRemove,
  readOnly = false,
}: UploadFileListProps) {
  if (files.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
        파일을 추가하세요
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {files.map((candidate) => (
        <div
          key={candidate.id}
          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
        >
          <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-600">
            <FileText className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{candidate.file.name}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
              <span>{formatBytes(candidate.sizeBytes)}</span>
              <span>{candidate.mimeType || 'unknown'}</span>
            </div>
          </div>

          {!readOnly ? (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              aria-label={`${candidate.file.name} 제거`}
              onClick={() => onRemove(candidate.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
