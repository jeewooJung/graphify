'use client'

import React, { useState } from 'react'
import { Search, Sparkles, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  onFilterChange?: (type: string | null) => void
}

export function SearchBar({ onSearch, onFilterChange }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleClear = () => {
    setSearchTerm('')
    onSearch('')
  }

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    onSearch(value)
  }

  const handleTypeFilter = (type: string) => {
    const newType = selectedType === type ? null : type
    setSelectedType(newType)
    onFilterChange?.(newType)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="mb-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
          <Sparkles size={14} className="text-primary-500" />
          Query builder
        </div>
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-quaternary" />
          <input
            type="text"
            placeholder="Search nodes, graphs, entities, owners..."
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            className="input-field h-12 pl-11 pr-12 text-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
          Filter
        </span>
        {['entity', 'concept', 'relation', 'graph'].map(type => (
          <button
            key={type}
            type="button"
            onClick={() => handleTypeFilter(type)}
            className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
              selectedType === type
                ? 'border-primary-500 bg-primary-500 text-white'
                : 'border-border bg-white/80 text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm leading-6 text-text-tertiary">
        Results update as you type. Combine filters to narrow by entity shape or graph context.
      </p>
    </div>
  )
}
