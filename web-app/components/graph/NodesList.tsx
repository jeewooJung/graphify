'use client'

import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui'

interface Node {
  id: string
  name: string
  type: 'entity' | 'concept' | 'relation'
  color: string
  count: number
}

const mockNodes: Node[] = [
  {
    id: '1',
    name: 'Product',
    type: 'entity',
    color: '#3366cc',
    count: 12,
  },
  {
    id: '2',
    name: 'User',
    type: 'entity',
    color: '#10b981',
    count: 8,
  },
  {
    id: '3',
    name: 'has_feature',
    type: 'relation',
    color: '#f59e0b',
    count: 15,
  },
  {
    id: '4',
    name: 'Architecture',
    type: 'concept',
    color: '#8b5cf6',
    count: 5,
  },
]

interface NodesListProps {
  selectedNodeId?: string
  onSelectNode?: (nodeId: string) => void
}

export function NodesList({ selectedNodeId, onSelectNode }: NodesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const filteredNodes = mockNodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || node.type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="app-card flex h-full flex-col overflow-hidden" role="region" aria-label="Nodes List">
      <div className="border-b border-border px-5 pb-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="panel-heading">Nodes</h2>
            <p className="mt-1 text-sm text-text-tertiary">
              {filteredNodes.length} visible entities
            </p>
          </div>
          <span className="app-chip">Filterable</span>
        </div>

        <div className="relative mt-4">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-quaternary" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field h-11 pl-10"
          />
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          {['entity', 'concept', 'relation'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                selectedType === type
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-border bg-white/82 text-text-tertiary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredNodes.map(node => (
          <div
            key={node.id}
            onClick={() => onSelectNode?.(node.id)}
            className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
              selectedNodeId === node.id
                ? 'border-primary-500 bg-primary-50/70'
                : 'border-border bg-white/74 hover:-translate-y-0.5 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: node.color }}
                  />
                  <h4 className="truncate text-sm font-semibold text-text-primary">
                    {node.name}
                  </h4>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge
                    variant={
                      node.type === 'entity'
                        ? 'primary'
                        : node.type === 'concept'
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {node.type}
                  </Badge>
                  <span className="app-chip">{node.count} connections</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
