'use client'

import React, { useState, useEffect } from 'react'
import { SearchBar, SearchResults } from '@/components/search'
import { PageHeader } from '@/components/ui'
import { searchService } from '@/lib/api/search-service'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'entity' | 'concept' | 'relation' | 'graph'
  connections?: number
  lastUpdated?: string
  color?: string
}

// Fallback mock data when API is not available
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
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch search results when query or filters change
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery && !selectedType) {
        setResults([])
        return
      }

      setLoading(true)
      setError('')

      const response = await searchService.search(searchQuery, {
        type: selectedType || undefined,
      })

      if (response.error) {
        // Fallback to mock data if API fails
        const filtered = MOCK_RESULTS.filter(result => {
          const matchesQuery = !searchQuery ||
            result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.description.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesType = !selectedType || result.type === selectedType
          return matchesQuery && matchesType
        })
        setResults(filtered)
        setError('')
      } else {
        setResults(response.data || [])
      }

      setLoading(false)
    }

    // Debounce search
    const timer = setTimeout(fetchResults, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedType])

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Knowledge retrieval"
        title="Search graph entities"
        description="Search across entities, concepts, relationships, and whole graphs without losing context. The new layout keeps controls visible while results remain easy to scan."
        meta={
          <>
            <span className="app-chip">Entity, concept, relation, graph</span>
            <span className="app-chip">Debounced live results</span>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(340px,0.95fr)_minmax(0,1.45fr)]">
        <div className="app-card p-6">
          <SearchBar
            onSearch={setSearchQuery}
            onFilterChange={setSelectedType}
          />
        </div>

        <div className="app-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="panel-heading">Results</div>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {searchQuery || selectedType
                  ? 'Matched against local fallback data or the connected search service.'
                  : 'Start with a term or filter to surface relevant graph entries.'}
              </p>
            </div>
            {(searchQuery || selectedType) && (
              <span className="app-chip">
                {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
              </span>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-500">
              {error}
            </div>
          )}

          {searchQuery || selectedType ? (
            <SearchResults
              results={results}
              loading={loading}
              query={searchQuery}
            />
          ) : (
            <div className="empty-state">
              <p>
                Start typing to search across your knowledge base
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
