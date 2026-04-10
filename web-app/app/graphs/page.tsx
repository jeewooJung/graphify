'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui'
import { GraphVisualization } from '@/components/graph/GraphVisualization'
import { NodesList } from '@/components/graph/NodesList'
import { PropertiesPanel } from '@/components/graph/PropertiesPanel'
import { Sparkles, Upload } from 'lucide-react'

export default function GraphsPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>()

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] flex-col gap-4 p-4 md:p-5">
      <div className="app-card flex flex-wrap items-start justify-between gap-4 px-4 py-4">
        <div className="min-w-0">
          <div className="page-eyebrow mb-0">Graph studio</div>
          <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.05em] text-text-primary">
            Relationship workspace
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Inspect nodes, follow relationships, and review properties without leaving the same surface.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="app-chip">3D graph canvas</span>
            <span className="app-chip">Node filters</span>
            <span className="app-chip">Property detail</span>
          </div>
        </div>

        <div className="page-actions">
          <Button variant="secondary">
            <Upload size={16} />
            Import nodes
          </Button>
          <Button variant="primary">
            <Sparkles size={16} />
            Save snapshot
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <div className="min-h-[320px] xl:min-h-0">
          <NodesList
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        </div>

        <div className="min-h-[420px] xl:min-h-0">
          <GraphVisualization
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        </div>

        <div className="min-h-[320px] xl:min-h-0">
          <PropertiesPanel selectedNodeId={selectedNodeId} />
        </div>
      </div>
    </div>
  )
}
