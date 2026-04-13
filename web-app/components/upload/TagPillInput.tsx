'use client'

import { useId, type KeyboardEvent } from 'react'

type TagPillInputProps = {
  label: string
  tags: string[]
  value: string
  availableTags: string[]
  placeholder: string
  onValueChange: (value: string) => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}

export function TagPillInput({
  label,
  tags,
  value,
  availableTags,
  placeholder,
  onValueChange,
  onAddTag,
  onRemoveTag,
}: TagPillInputProps) {
  const listId = useId()
  const commit = () => {
    if (!value.trim()) return
    onAddTag(value)
    onValueChange('')
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="rounded-xl border border-slate-200 px-3 py-2">
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
              onClick={() => onRemoveTag(tag)}
            >
              {tag} x
            </button>
          ))}
        </div>
        <input
          list={listId}
          value={value}
          placeholder={placeholder}
          className="w-full border-0 p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          onBlur={commit}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault()
              commit()
            }
          }}
        />
        <datalist id={listId}>
          {availableTags.map((tag) => <option key={tag} value={tag} />)}
        </datalist>
      </div>
    </div>
  )
}
