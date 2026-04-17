'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import type { DocumentMetadataInput, FileCandidate } from '@/types/document'
import { TagPillInput } from './TagPillInput'
import { uniqueTags } from './uploadUtils'

type UploadMetadataFormProps = {
  files: FileCandidate[]
  values: Record<string, DocumentMetadataInput>
  availableTags: string[]
  onChange: (fileId: string, next: DocumentMetadataInput) => void
  onBulkApply: (partial: Partial<DocumentMetadataInput>) => void
}

const DOC_TYPES = ['PDF', 'MARKDOWN', 'DOCX', 'TXT'] as const

export function UploadMetadataForm({
  files,
  values,
  availableTags,
  onChange,
  onBulkApply,
}: UploadMetadataFormProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>(files[0]?.id)
  const [activeTagInput, setActiveTagInput] = useState('')
  const [bulkTitle, setBulkTitle] = useState('')
  const [bulkDocType, setBulkDocType] = useState('')
  const [bulkTagInput, setBulkTagInput] = useState('')
  const [bulkTags, setBulkTags] = useState<string[]>([])
  const activeFileId = files.length === 0
    ? undefined
    : files.some((file) => file.id === selectedFileId)
      ? selectedFileId
      : files[0].id

  if (files.length === 0 || !activeFileId) {
    return <p className="text-sm text-slate-500">메타데이터를 입력할 파일이 없습니다.</p>
  }

  const activeValue = values[activeFileId] ?? { tags: [] }
  const applyActive = (partial: Partial<DocumentMetadataInput>) => {
    onChange(activeFileId, { ...activeValue, ...partial })
  }

  const bulkPartial: Partial<DocumentMetadataInput> = {}
  if (bulkTitle.trim()) bulkPartial.title = bulkTitle.trim()
  if (bulkDocType) bulkPartial.docType = bulkDocType
  if (bulkTags.length > 0) bulkPartial.tags = bulkTags

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {files.map((file) => (
          <button
            key={file.id}
            type="button"
            className={[
              'rounded-full px-3 py-1.5 text-sm transition-colors',
              file.id === activeFileId ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600',
            ].join(' ')}
            onClick={() => setSelectedFileId(file.id)}
          >
            {file.file.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        <Input label="제목" value={activeValue.title ?? ''} placeholder="문서 제목" onChange={(event) => applyActive({ title: event.target.value })} />
        <TagPillInput label="태그" tags={activeValue.tags} value={activeTagInput} availableTags={availableTags} placeholder="태그 입력 후 Enter" onValueChange={setActiveTagInput} onAddTag={(tag) => applyActive({ tags: uniqueTags([...activeValue.tags, tag]) })} onRemoveTag={(tag) => applyActive({ tags: activeValue.tags.filter((item) => item !== tag) })} />
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>문서 유형</span>
          <select className="input-field" value={activeValue.docType ?? ''} onChange={(event) => applyActive({ docType: event.target.value || undefined })}>
            <option value="">선택하세요</option>
            {DOC_TYPES.map((docType) => <option key={docType} value={docType}>{docType}</option>)}
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-4 text-sm font-semibold text-slate-900">Apply to all</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Input value={bulkTitle} placeholder="공통 제목" onChange={(event) => setBulkTitle(event.target.value)} />
          <select className="input-field" value={bulkDocType} onChange={(event) => setBulkDocType(event.target.value)}>
            <option value="">공통 문서 유형</option>
            {DOC_TYPES.map((docType) => <option key={docType} value={docType}>{docType}</option>)}
          </select>
        </div>

        <div className="mt-4">
          <TagPillInput label="공통 태그" tags={bulkTags} value={bulkTagInput} availableTags={availableTags} placeholder="태그 입력 후 Enter" onValueChange={setBulkTagInput} onAddTag={(tag) => setBulkTags((current) => uniqueTags([...current, tag]))} onRemoveTag={(tag) => setBulkTags((current) => current.filter((item) => item !== tag))} />
        </div>

        <Button className="mt-4" variant="secondary" type="button" disabled={Object.keys(bulkPartial).length === 0} onClick={() => onBulkApply(bulkPartial)}>
          Apply to all
        </Button>
      </div>
    </div>
  )
}
