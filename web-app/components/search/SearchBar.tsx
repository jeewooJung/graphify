'use client'

import React, { useState } from 'react'
import { Search, X } from 'lucide-react'

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

  const handleTypeFilter = (type: string) => {
    const newType = selectedType === type ? null : type
    setSelectedType(newType)
    onFilterChange?.(newType)
  }

  return (
    <div className="w-full">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-3" style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search nodes, graphs, entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 pr-10 h-10 text-base"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-2.5 text-text-tertiary hover:text-text-primary"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <span style={{ color: 'var(--color-text-tertiary)' }} className="text-sm font-medium self-center">Filter:</span>
        {['entity', 'concept', 'relation', 'graph'].map(type => (
          <button
            key={type}
            onClick={() => handleTypeFilter(type)}
            className={`text-sm px-3 py-1.5 rounded transition-colors ${
              selectedType === type
                ? 'text-white'
                : 'text-text-secondary hover:bg-surface-hover'
            }`}
            style={selectedType === type ? { backgroundColor: 'var(--color-primary-500)' } : { backgroundColor: 'var(--color-surface)' }}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  )
}
