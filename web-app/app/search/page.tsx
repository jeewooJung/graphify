'use client'

import React, { useState, useEffect } from 'react'
import { SearchBar, SearchResults } from '@/components/search'
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
          {error && (
            <div style={{ backgroundColor: '#fee2e2', borderColor: '#fecaca', color: 'var(--color-error)' }} className="p-4 rounded mb-4 border">
              {error}
            </div>
          )}

          {searchQuery || selectedType ? (
            <>
              <p style={{ color: 'var(--color-text-tertiary)' }} className="text-sm mb-4">
                {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
              </p>
              <SearchResults
                results={results}
                loading={loading}
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
