'use client'

import React from 'react'
import { Move3D, Orbit, ScanSearch } from 'lucide-react'
import { GraphCanvas } from './GraphCanvas'

interface GraphVisualizationProps {
  selectedNodeId?: string
  onSelectNode?: (nodeId: string) => void
}

export function GraphVisualization({ selectedNodeId, onSelectNode }: GraphVisualizationProps) {
  return (
    <div className="relative h-full overflow-hidden rounded-[28px] border border-border bg-[radial-gradient(circle_at_top,rgba(79,110,247,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(247,248,251,0.86)_100%)] shadow-card">
      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
        <span className="app-chip">
          <Orbit size={14} />
          Relation map
        </span>
        <span className="app-chip">
          <Move3D size={14} />
          Drag to orbit
        </span>
      </div>

      <div className="absolute bottom-4 left-4 z-10 rounded-2xl border border-border bg-white/82 px-4 py-3 shadow-panel">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <ScanSearch size={16} className="text-primary-500" />
          {selectedNodeId ? `Inspecting node ${selectedNodeId}` : 'Select a node to inspect'}
        </div>
        <p className="mt-1 text-xs leading-5 text-text-tertiary">
          Zoom, pan, and pick nodes directly from the canvas.
        </p>
      </div>

      <div className="h-full min-h-[420px]">
        <GraphCanvas selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />
      </div>
    </div>
  )
}
