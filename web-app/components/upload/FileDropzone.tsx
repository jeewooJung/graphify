'use client'

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { FileUp } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatAcceptList, formatBytes, matchesAccept } from './uploadUtils'

type FileDropzoneProps = {
  accept: string[]
  maxSizeBytes: number
  onFiles: (files: File[]) => void
  disabled?: boolean
}

export function FileDropzone({
  accept,
  maxSizeBytes,
  onFiles,
  disabled = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const submitFiles = (fileList: FileList | null) => {
    if (!fileList || disabled) return

    const nextFiles = Array.from(fileList).filter(
      (file) => matchesAccept(file, accept) && file.size <= maxSizeBytes
    )

    if (nextFiles.length > 0) onFiles(nextFiles)
  }

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleDragEvent = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    handleDragEvent(event)
    setIsDragOver(false)
    submitFiles(event.dataTransfer.files)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    submitFiles(event.target.files)
    event.target.value = ''
  }

  return (
    <div
      className={[
        'rounded-2xl border-2 border-dashed p-6 text-center transition-colors',
        disabled ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60' : 'cursor-pointer',
        isDragOver ? 'border-slate-900 bg-slate-100' : 'border-slate-300 bg-white',
      ].join(' ')}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={openPicker}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
          event.preventDefault()
          openPicker()
        }
      }}
      onDragEnter={(event) => {
        handleDragEvent(event)
        if (!disabled) setIsDragOver(true)
      }}
      onDragOver={handleDragEvent}
      onDragLeave={(event) => {
        handleDragEvent(event)
        setIsDragOver(false)
      }}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        hidden
        multiple
        type="file"
        accept={accept.join(',')}
        disabled={disabled}
        onChange={handleChange}
      />

      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
        <FileUp className="h-6 w-6" />
      </div>
      <p className="text-base font-semibold text-slate-900">파일을 드래그하거나 선택하세요</p>
      <p className="mt-2 text-sm text-slate-500">
        허용 형식: {formatAcceptList(accept)} / 최대 크기: {formatBytes(maxSizeBytes)}
      </p>
      <Button
        className="mt-4"
        variant="secondary"
        type="button"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation()
          openPicker()
        }}
      >
        파일 선택
      </Button>
    </div>
  )
}
