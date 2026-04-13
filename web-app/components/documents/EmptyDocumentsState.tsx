'use client'

import { useRef, useState } from 'react'
import clsx from 'clsx'
import { UploadCloud } from 'lucide-react'
import { Button, Card } from '@/components/ui'

type EmptyDocumentsStateProps = {
  canUpload: boolean
  onOpenUpload: () => void
  onFilesDropped: (files: File[]) => void
}

const SUPPORTED_FORMATS = ['PDF', 'Markdown', 'Docx', 'Txt']

export function EmptyDocumentsState({
  canUpload,
  onOpenUpload,
  onFilesDropped,
}: EmptyDocumentsStateProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    const nextFiles = files ? Array.from(files) : []
    if (nextFiles.length) onFilesDropped(nextFiles)
  }

  return (
    <Card className="p-6">
      <div
        className={clsx(
          'flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed px-6 py-10 text-center transition-colors',
          isDragging
            ? 'border-primary-500 bg-primary-500/6'
            : 'border-border bg-[rgba(255,255,255,0.7)]'
        )}
        onDragOver={(event) => {
          if (!canUpload) return
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => canUpload && setIsDragging(false)}
        onDrop={(event) => {
          if (!canUpload) return
          event.preventDefault()
          setIsDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
      >
        <div className="mb-4 rounded-full border border-border bg-white p-4 text-primary-600 shadow-panel">
          <UploadCloud size={28} />
        </div>
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-text-primary">Drop files here</h2>
        <p className="mt-3 max-w-[520px] text-sm leading-6 text-text-secondary">
          Add knowledge sources for this project. Drag files into the dropzone or use the upload flow.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {SUPPORTED_FORMATS.map((format) => (
            <span key={format} className="app-chip">{format}</span>
          ))}
        </div>

        {canUpload ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
              Choose files
            </Button>
            <span className="text-sm text-text-tertiary">or</span>
            <Button type="button" variant="ghost" onClick={onOpenUpload}>
              click Upload
            </Button>
          </div>
        ) : (
          <p className="mt-6 text-sm font-medium text-text-tertiary">\uAD00\uB9AC\uC790\uC5D0\uAC8C \uBB38\uC758\uD558\uC138\uC694</p>
        )}

        <input
          ref={inputRef}
          hidden
          type="file"
          multiple
          disabled={!canUpload}
          accept=".pdf,.md,.markdown,.docx,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>
    </Card>
  )
}
