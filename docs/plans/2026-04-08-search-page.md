# Search Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Search page with 1-panel layout (search form + results list) using Linear light design

**Architecture:**
- Single-panel responsive layout (no sidebars, full width for search/results)
- Search bar with input field and filters
- Results list showing nodes/graphs matching search query
- Integration with existing Header and Sidebar

**Tech Stack:**
- React (state management with useState)
- Tailwind CSS (Linear light styling)
- Next.js 14 (App Router)
- Lucide React (icons)

---

## Phase 1: Create Search Page Layout

### Task 1: Create SearchBar component

**Files:**
- Create: `web-app/components/search/SearchBar.tsx`

**Step 1: Create SearchBar component**

```typescript
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
```

---

### Task 2: Create SearchResults component

**Files:**
- Create: `web-app/components/search/SearchResults.tsx`

**Step 1: Create SearchResults component**

```typescript
'use client'

import React from 'react'
import { Badge } from '@/components/ui'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'entity' | 'concept' | 'relation' | 'graph'
  connections?: number
  lastUpdated?: string
  color?: string
}

interface SearchResultsProps {
  results: SearchResult[]
  loading?: boolean
  query?: string
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Product',
    description: 'Entity representing a product in the system',
    type: 'entity',
    connections: 12,
    lastUpdated: '2024-04-08',
    color: '#3366cc',
  },
  {
    id: '2',
    title: 'User Management System',
    description: 'Graph containing all user-related entities and relationships',
    type: 'graph',
    connections: 25,
    lastUpdated: '2024-04-07',
    color: '#10b981',
  },
  {
    id: '3',
    title: 'has_feature',
    description: 'Relationship indicating a product has a feature',
    type: 'relation',
    connections: 15,
    lastUpdated: '2024-04-06',
    color: '#f59e0b',
  },
  {
    id: '4',
    title: 'Architecture',
    description: 'Concept representing system architecture and design patterns',
    type: 'concept',
    connections: 8,
    lastUpdated: '2024-04-05',
    color: '#8b5cf6',
  },
  {
    id: '5',
    title: 'Customer',
    description: 'Entity representing customer information',
    type: 'entity',
    connections: 20,
    lastUpdated: '2024-04-04',
    color: '#3366cc',
  },
]

export function SearchResults({ results = mockResults, loading = false, query = '' }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-text-tertiary)' }}>Searching...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-text-tertiary)' }} className="mb-2">
          No results found {query && `for "${query}"`}
        </p>
        <p style={{ color: 'var(--color-text-tertiary)' }} className="text-sm">
          Try different keywords or filters
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {results.map(result => (
        <div
          key={result.id}
          className="p-4 rounded-lg border transition-colors hover:bg-surface-hover"
          style={{ borderColor: 'var(--color-border)', backgroundColor: '#ffffff' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {result.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: result.color }}
                  />
                )}
                <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold text-base">
                  {result.title}
                </h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mb-2">
                {result.description}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="primary">{result.type}</Badge>
                {result.connections && (
                  <span style={{ color: 'var(--color-text-tertiary)' }} className="text-xs">
                    {result.connections} connections
                  </span>
                )}
                {result.lastUpdated && (
                  <span style={{ color: 'var(--color-text-tertiary)' }} className="text-xs">
                    Updated: {result.lastUpdated}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

### Task 3: Create search/index.ts exports

**Files:**
- Create: `web-app/components/search/index.ts`

**Step 1: Create index file**

```typescript
export { SearchBar } from './SearchBar'
export { SearchResults } from './SearchResults'
```

---

### Task 4: Create search/page.tsx

**Files:**
- Create: `web-app/app/search/page.tsx`

**Step 1: Create search page**

```typescript
'use client'

import React, { useState, useMemo } from 'react'
import { SearchBar, SearchResults } from '@/components/search'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'entity' | 'concept' | 'relation' | 'graph'
  connections?: number
  lastUpdated?: string
  color?: string
}

const MOCK_RESULTS: SearchResult[] = [
  {
    id: '1',
    title: 'Product',
    description: 'Entity representing a product in the system',
    type: 'entity',
    connections: 12,
    lastUpdated: '2024-04-08',
    color: '#3366cc',
  },
  {
    id: '2',
    title: 'User Management System',
    description: 'Graph containing all user-related entities and relationships',
    type: 'graph',
    connections: 25,
    lastUpdated: '2024-04-07',
    color: '#10b981',
  },
  {
    id: '3',
    title: 'has_feature',
    description: 'Relationship indicating a product has a feature',
    type: 'relation',
    connections: 15,
    lastUpdated: '2024-04-06',
    color: '#f59e0b',
  },
  {
    id: '4',
    title: 'Architecture',
    description: 'Concept representing system architecture and design patterns',
    type: 'concept',
    connections: 8,
    lastUpdated: '2024-04-05',
    color: '#8b5cf6',
  },
  {
    id: '5',
    title: 'Customer',
    description: 'Entity representing customer information',
    type: 'entity',
    connections: 20,
    lastUpdated: '2024-04-04',
    color: '#3366cc',
  },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // Filter results based on search query and selected type
  const filteredResults = useMemo(() => {
    return MOCK_RESULTS.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = !selectedType || result.type === selectedType
      return matchesQuery && matchesType
    })
  }, [searchQuery, selectedType])

  return (
    <div style={{ backgroundColor: '#ffffff' }} className="min-h-screen">
      {/* Header Section */}
      <div style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }} className="px-8 py-6">
        <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-semibold mb-2">
          Search
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Find nodes, graphs, and relationships across your knowledge base
        </p>
      </div>

      {/* Search Section */}
      <div className="px-8 py-8">
        <div className="max-w-3xl mb-8">
          <SearchBar
            onSearch={setSearchQuery}
            onFilterChange={setSelectedType}
          />
        </div>

        {/* Results Section */}
        <div className="max-w-4xl">
          {searchQuery || selectedType ? (
            <>
              <p style={{ color: 'var(--color-text-tertiary)' }} className="text-sm mb-4">
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
              </p>
              <SearchResults
                results={filteredResults}
                query={searchQuery}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <p style={{ color: 'var(--color-text-tertiary)' }}>
                Start typing to search across your knowledge base
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

### Task 5: Verify search layout and commit

**Files:**
- Verify: `web-app/app/search/page.tsx`
- Verify: `web-app/components/search/SearchBar.tsx`
- Verify: `web-app/components/search/SearchResults.tsx`

**Step 1: Commit**

```bash
cd web-app
git add app/search/ components/search/
git commit -m "feat: create search page with 1-panel layout, search bar, and results list"
```

**Step 2: Test in dev server**

```bash
npm run dev
# Navigate to http://localhost:3000/search
# Verify:
# 1. Search bar is visible with input field
# 2. Filter buttons work (entity, concept, relation, graph)
# 3. Results list displays mock data
# 4. Typing filters results in real-time
# 5. No console errors
```

---

## Summary

**Total Tasks:** 5  
**Estimated Time:** 30-45 minutes  
**Deliverables:**
- ✅ SearchBar component with filters
- ✅ SearchResults component with mock data
- ✅ Search page (1-panel layout)
- ✅ Real-time filtering by query and type
- ✅ Linear light styling throughout

---

**Next Phase:** User Authentication (login/logout, role-based access)
