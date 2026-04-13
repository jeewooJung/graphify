'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Badge, Input } from '@/components/ui'
import { DocumentSearchInput } from './DocumentSearchInput'
import type { DocumentFilterState, DocumentStatus } from '@/types/document'

type DocumentFiltersProps = {
  value: DocumentFilterState
  availableTags: string[]
  availableDocTypes?: string[]
  onChange: (next: DocumentFilterState) => void
}

const DEFAULT_DOC_TYPES = ['PDF', 'MARKDOWN', 'DOCX', 'TXT']
const STATUSES: DocumentStatus[] = ['UPLOADED', 'QUEUED', 'PARSING', 'INDEXING', 'READY', 'FAILED']

type ChipGroupProps = {
  label: string
  options: string[]
  selected: string[]
  onToggle: (option: string) => void
}

function ChipGroup({ label, options, selected, onToggle }: ChipGroupProps) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={clsx(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                active
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-border bg-white text-text-secondary hover:bg-surface-hover'
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DocumentFilters({
  value,
  availableTags,
  availableDocTypes = DEFAULT_DOC_TYPES,
  onChange,
}: DocumentFiltersProps) {
  const [tagQuery, setTagQuery] = useState('')
  const visibleTags = useMemo(() => {
    const query = tagQuery.trim().toLowerCase()
    return availableTags.filter((tag) => !query || tag.toLowerCase().includes(query)).slice(0, 12)
  }, [availableTags, tagQuery])

  const toggleValue = (key: 'statuses' | 'docTypes' | 'tags', option: string) => {
    const current = value[key] as string[]
    const nextValues = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option]
    onChange({ ...value, [key]: nextValues })
  }

  return (
    <div className="app-card space-y-4 p-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-[260px] flex-1">
          <DocumentSearchInput
            value={value.query ?? ''}
            onChange={(query) => onChange({ ...value, query })}
            placeholder="Search title, filename, or summary"
          />
        </div>

        <div className="grid min-w-[240px] gap-3 sm:grid-cols-2">
          <Input
            type="date"
            value={value.uploadedFrom ?? ''}
            onChange={(event) => onChange({ ...value, uploadedFrom: event.target.value || undefined })}
          />
          <Input
            type="date"
            value={value.uploadedTo ?? ''}
            onChange={(event) => onChange({ ...value, uploadedTo: event.target.value || undefined })}
          />
        </div>
      </div>

      <ChipGroup
        label="Status"
        options={STATUSES}
        selected={value.statuses}
        onToggle={(option) => toggleValue('statuses', option)}
      />

      <ChipGroup
        label="Type"
        options={availableDocTypes}
        selected={value.docTypes}
        onToggle={(option) => toggleValue('docTypes', option)}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">Tags</p>
          <div className="w-full max-w-[260px]">
            <Input
              value={tagQuery}
              placeholder="Filter available tags"
              onChange={(event) => setTagQuery(event.target.value)}
              className="h-9"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleValue('tags', tag)}
              className={clsx(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                value.tags.includes(tag)
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-border bg-white text-text-secondary hover:bg-surface-hover'
              )}
            >
              #{tag}
            </button>
          ))}
          {!visibleTags.length ? (
            <Badge variant="default">No matching tags</Badge>
          ) : null}
        </div>
      </div>
    </div>
  )
}
