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
