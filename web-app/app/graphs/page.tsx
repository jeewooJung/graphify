'use client'

import React, { useState } from 'react'
import { GraphVisualization } from '@/components/graph/GraphVisualization'
import { NodesList } from '@/components/graph/NodesList'
import { PropertiesPanel } from '@/components/graph/PropertiesPanel'

export default function GraphsPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>()

  return (
    <div className="h-[calc(100vh-56px)] flex">
      {/* Left Panel - Nodes List (280px) */}
      <div style={{ borderRightColor: 'var(--color-border)', borderRightWidth: '1px' }} className="w-80 overflow-hidden">
        <NodesList
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
      </div>

      {/* Center Panel - Graph Canvas (flexible) */}
      <div className="flex-1 overflow-hidden">
        <GraphVisualization />
      </div>

      {/* Right Panel - Properties (400px) */}
      <div style={{ borderLeftColor: 'var(--color-border)', borderLeftWidth: '1px', backgroundColor: '#ffffff' }} className="w-96 overflow-hidden">
        <PropertiesPanel selectedNodeId={selectedNodeId} />
      </div>
    </div>
  )
}
