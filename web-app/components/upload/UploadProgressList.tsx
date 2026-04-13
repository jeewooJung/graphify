'use client'

import { Button } from '@/components/ui'
import type { FileCandidate, UploadProgress } from '@/types/document'
import { formatBytes } from './uploadUtils'

type UploadProgressListProps = {
  files: FileCandidate[]
  progressByFile: Record<string, UploadProgress>
  onCancel: (fileId: string) => void
}

const STATE_LABELS: Record<UploadProgress['state'], string> = {
  PENDING: '대기',
  UPLOADING: '업로드 중',
  SERVER_PROCESSING: '분석 준비',
  SUCCEEDED: '완료',
  FAILED: '실패',
  CANCELLED: '취소됨',
}

export function UploadProgressList({
  files,
  progressByFile,
  onCancel,
}: UploadProgressListProps) {
  const rows = files.filter((file) => progressByFile[file.id])

  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">진행 중인 업로드가 없습니다.</p>
  }

  return (
    <div className="space-y-3">
      {rows.map((file) => {
        const progress = progressByFile[file.id]
        const percent = progress.totalBytes > 0
          ? Math.min(100, Math.round((progress.loadedBytes / progress.totalBytes) * 100))
          : 0
        const cancellable = progress.state === 'PENDING' || progress.state === 'UPLOADING'

        return (
          <div key={file.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{file.file.name}</p>
                  <span className="text-xs font-medium text-slate-500">{STATE_LABELS[progress.state]}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatBytes(progress.loadedBytes)} / {formatBytes(progress.totalBytes || file.sizeBytes)} · {percent}%
                </p>
              </div>

              {cancellable ? (
                <Button variant="ghost" size="sm" type="button" onClick={() => onCancel(file.id)}>
                  취소
                </Button>
              ) : null}
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-900 transition-[width]" style={{ width: `${percent}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
