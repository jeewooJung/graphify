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
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }} className="p-4">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-lg font-semibold mb-3">Nodes</h2>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-2.5" style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9 h-8"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 flex-wrap">
          {['entity', 'concept', 'relation'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
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

      {/* Nodes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredNodes.map(node => (
          <div
            key={node.id}
            onClick={() => onSelectNode?.(node.id)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedNodeId === node.id
                ? 'border-l-3'
                : 'hover:bg-surface-hover'
            }`}
            style={selectedNodeId === node.id ? {
              backgroundColor: '#dbeafe',
              borderLeftColor: 'var(--color-primary-500)',
              borderLeftWidth: '3px'
            } : {}}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: node.color }}
                  />
                  <h4 style={{ color: 'var(--color-text-primary)' }} className="font-medium truncate">
                    {node.name}
                  </h4>
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="primary">{node.type}</Badge>
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{node.count} connections</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
