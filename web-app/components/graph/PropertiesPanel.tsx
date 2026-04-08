'use client'

import React from 'react'

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
      <div className="h-full flex items-center justify-center">
        <p style={{ color: 'var(--color-text-tertiary)' }}>Select a node to view properties</p>
      </div>
    )
  }

  const details = mockNodeDetails

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }} className="p-4">
        <h2 style={{ color: 'var(--color-text-primary)' }} className="text-lg font-semibold">{details.name}</h2>
        <p style={{ color: 'var(--color-text-tertiary)' }} className="text-xs mt-1">{details.description}</p>
      </div>

      {/* Properties */}
      <div className="p-4 space-y-4">
        {/* Type */}
        <div>
          <p style={{ color: 'var(--color-text-tertiary)' }} className="text-xs font-semibold mb-1">Type</p>
          <p style={{ color: 'var(--color-text-primary)' }} className="text-sm">{details.type}</p>
        </div>

        {/* Properties Table */}
        <div>
          <p style={{ color: 'var(--color-text-tertiary)' }} className="text-xs font-semibold mb-2">Properties</p>
          <div className="space-y-2">
            {details.properties.map(prop => (
              <div key={prop.id} className="p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-primary)' }} className="font-medium">{prop.name}</span>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>{prop.type}</span>
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }} className="mt-1">{prop.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Nodes */}
        <div>
          <p style={{ color: 'var(--color-text-tertiary)' }} className="text-xs font-semibold mb-2">Related Nodes</p>
          <div className="flex flex-wrap gap-1">
            {details.relatedNodes.map(node => (
              <span key={node} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#dbeafe', color: 'var(--color-primary-700)' }}>
                {node}
              </span>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div style={{ borderTopColor: 'var(--color-border)' }} className="border-t pt-4">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-tertiary)' }}>Created:</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{details.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-tertiary)' }}>Updated:</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{details.updatedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
