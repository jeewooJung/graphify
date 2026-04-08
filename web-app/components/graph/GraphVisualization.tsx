'use client'

import React from 'react'
import { GraphCanvas } from './GraphCanvas'

interface GraphVisualizationProps {
  selectedNodeId?: string
  onSelectNode?: (nodeId: string) => void
}

export function GraphVisualization({ selectedNodeId, onSelectNode }: GraphVisualizationProps) {
  return (
    <div className="w-full h-full">
      <GraphCanvas selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
    </div>
  )
}
