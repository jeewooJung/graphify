'use client'

import React from 'react'
import { Badge } from '@/components/ui'

interface NodeProperty {
  id: string
  name: string
  value: string
  type: 'string' | 'number' | 'date' | 'array'
}

interface NodeDetails {
  id: string
  name: string
  description: string
  type: 'entity' | 'concept' | 'relation'
  properties: NodeProperty[]
  relatedNodes: string[]
  createdAt: string
  updatedAt: string
}

const mockNodeDetails: NodeDetails = {
  id: '1',
  name: 'Product',
  description: 'Entity representing a product in the system',
  type: 'entity',
  properties: [
    { id: '1', name: 'title', value: 'Product Name', type: 'string' },
    { id: '2', name: 'price', value: '99.99', type: 'number' },
    { id: '3', name: 'sku', value: 'SKU-12345', type: 'string' },
    { id: '4', name: 'tags', value: 'electronics, gadgets', type: 'array' },
  ],
  relatedNodes: ['User', 'Review', 'Category'],
  createdAt: '2024-01-15',
  updatedAt: '2024-04-08',
}

interface PropertiesPanelProps {
  selectedNodeId?: string
}

export function PropertiesPanel({ selectedNodeId }: PropertiesPanelProps) {
  if (!selectedNodeId) {
    return (
      <div className="app-card flex h-full items-center justify-center p-6">
        <p className="max-w-xs text-center text-sm leading-6 text-text-tertiary">
          Select a node to inspect property values, related nodes, and update history.
        </p>
      </div>
    )
  }

  const details = mockNodeDetails

  return (
    <div className="app-card flex h-full flex-col overflow-y-auto">
      <div className="border-b border-border px-5 pb-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="panel-heading">{details.name}</h2>
            <p className="mt-1 text-sm leading-6 text-text-tertiary">{details.description}</p>
          </div>
          <Badge
            variant={
              details.type === 'entity'
                ? 'primary'
                : details.type === 'concept'
                  ? 'warning'
                  : 'default'
            }
          >
            {details.type}
          </Badge>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <p className="kpi-label">Properties</p>
          <div className="mt-3 space-y-2">
            {details.properties.map(prop => (
              <div key={prop.id} className="rounded-2xl border border-border bg-white/78 p-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-text-primary">{prop.name}</span>
                  <span className="text-xs uppercase tracking-[0.08em] text-text-tertiary">{prop.type}</span>
                </div>
                <div className="mt-2 text-sm leading-6 text-text-secondary">{prop.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="kpi-label">Related nodes</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {details.relatedNodes.map(node => (
              <span key={node} className="app-chip">
                {node}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-hover p-4">
          <p className="kpi-label">Metadata</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-text-tertiary">Created</span>
              <span className="font-medium text-text-primary">{details.createdAt}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-tertiary">Updated</span>
              <span className="font-medium text-text-primary">{details.updatedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
