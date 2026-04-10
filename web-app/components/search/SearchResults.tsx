'use client'

import React from 'react'
import { Badge } from '@/components/ui'
import { ArrowUpRight, Network, Shapes, Sparkles, Waypoints } from 'lucide-react'

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
      <div className="empty-state">
        <p>Searching the workspace...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="empty-state flex-col gap-2">
        <p className="text-sm font-medium text-text-secondary">
          No results found {query && `for "${query}"`}
        </p>
        <p className="text-sm text-text-tertiary">
          Try different keywords or filters
        </p>
      </div>
    )
  }

  const typeMeta = {
    entity: { icon: <Shapes size={14} />, variant: 'primary' as const },
    concept: { icon: <Sparkles size={14} />, variant: 'warning' as const },
    relation: { icon: <Waypoints size={14} />, variant: 'default' as const },
    graph: { icon: <Network size={14} />, variant: 'success' as const },
  }

  return (
    <div className="space-y-3">
      {results.map(result => (
        <div
          key={result.id}
          className="rounded-2xl border border-border bg-white/72 p-5 transition-all hover:-translate-y-0.5 hover:bg-white"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 gap-4">
              <div
                className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: result.color ? `${result.color}20` : 'var(--primary-soft)' }}
              >
                {typeMeta[result.type].icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="truncate text-base font-semibold text-text-primary">
                    {result.title}
                  </h3>
                  <Badge variant={typeMeta[result.type].variant}>{result.type}</Badge>
                </div>
                {result.color && (
                  <div
                    className="mb-3 h-1.5 w-16 rounded-full"
                    style={{ backgroundColor: result.color }}
                  />
                )}
                <p className="text-sm leading-6 text-text-secondary">
                {result.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                {result.connections && (
                    <span className="app-chip">
                    {result.connections} connections
                    </span>
                )}
                {result.lastUpdated && (
                    <span className="app-chip">
                    Updated: {result.lastUpdated}
                    </span>
                )}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/85 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
