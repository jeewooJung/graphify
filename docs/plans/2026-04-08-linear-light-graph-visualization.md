# Linear Light Graph Visualization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready Graph Visualization page with 3-panel layout (nodes list | graph canvas | properties panel) using React Three Fiber for graph rendering

**Architecture:**
- 3-panel responsive layout (240px sidebar | flexible center | 400px right panel)
- Interactive graph canvas using React Three Fiber + Three.js
- Node list panel with search/filter
- Properties panel for selected node details
- Zoom, pan, and node selection interactivity

**Tech Stack:**
- React Three Fiber (3D graph rendering)
- Three.js (3D graphics)
- React (state management)
- Tailwind CSS (styling)
- Zustand (optional, for state management)

---

## Phase 1: Graph Visualization Layout

### Task 1: Create Graph Visualization page layout

**Files:**
- Create: `app/graphs/page.tsx`
- Create: `app/graphs/layout.tsx`
- Create: `components/graph/GraphVisualization.tsx`
- Create: `components/graph/NodesList.tsx`
- Create: `components/graph/PropertiesPanel.tsx`

**Step 1: Create graphs layout.tsx**

```typescript
'use client'

import React, { useState } from 'react'
import { Header, Sidebar } from '@/components/layout'

export default function GraphsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Step 2: Create NodesList component**

```typescript
'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Input, Badge } from '@/components/ui'
import { Search, Plus } from 'lucide-react'

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
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Nodes</h2>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-2.5 text-text-tertiary" />
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
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface text-text-secondary hover:bg-surface-hover'
              }`}
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
                ? 'bg-blue-100 border-l-3 border-primary-500'
                : 'hover:bg-surface-hover'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: node.color }}
                  />
                  <h4 className="font-medium text-text-primary truncate">
                    {node.name}
                  </h4>
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="default">{node.type}</Badge>
                  <span className="text-xs text-text-tertiary">{node.count} connections</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Create PropertiesPanel component**

```typescript
'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

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
        <p className="text-text-tertiary">Select a node to view properties</p>
      </div>
    )
  }

  const details = mockNodeDetails

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold text-text-primary">{details.name}</h2>
        <p className="text-xs text-text-tertiary mt-1">{details.description}</p>
      </div>

      {/* Properties */}
      <div className="p-4 space-y-4">
        {/* Type */}
        <div>
          <p className="text-xs font-semibold text-text-tertiary mb-1">Type</p>
          <p className="text-sm text-text-primary">{details.type}</p>
        </div>

        {/* Properties Table */}
        <div>
          <p className="text-xs font-semibold text-text-tertiary mb-2">Properties</p>
          <div className="space-y-2">
            {details.properties.map(prop => (
              <div key={prop.id} className="bg-surface p-2 rounded text-xs">
                <div className="flex justify-between">
                  <span className="font-medium text-text-primary">{prop.name}</span>
                  <span className="text-text-tertiary">{prop.type}</span>
                </div>
                <div className="text-text-secondary mt-1">{prop.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Nodes */}
        <div>
          <p className="text-xs font-semibold text-text-tertiary mb-2">Related Nodes</p>
          <div className="flex flex-wrap gap-1">
            {details.relatedNodes.map(node => (
              <span key={node} className="bg-blue-100 text-primary-700 text-xs px-2 py-1 rounded">
                {node}
              </span>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t border-border pt-4">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Created:</span>
              <span className="text-text-primary">{details.createdAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Updated:</span>
              <span className="text-text-primary">{details.updatedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Create GraphVisualization component (placeholder)**

```typescript
'use client'

import React from 'react'

export function GraphVisualization() {
  return (
    <div className="w-full h-full bg-surface flex items-center justify-center">
      <p className="text-text-tertiary">Graph Canvas (React Three Fiber)</p>
    </div>
  )
}
```

**Step 5: Create graphs page.tsx**

```typescript
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
      <div className="w-80 border-r border-border overflow-hidden">
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
      <div className="w-96 border-l border-border overflow-hidden bg-white">
        <PropertiesPanel selectedNodeId={selectedNodeId} />
      </div>
    </div>
  )
}
```

**Step 6: Create graph components index**

```typescript
// components/graph/index.ts
export { GraphVisualization } from './GraphVisualization'
export { NodesList } from './NodesList'
export { PropertiesPanel } from './PropertiesPanel'
```

**Step 7: Commit**

```bash
git add app/graphs/ components/graph/
git commit -m "feat: create 3-panel graph visualization layout with nodes list and properties panel"
```

---

## Phase 2: Install Three.js Dependencies

### Task 2: Install and configure Three.js

**Step 1: Install dependencies**

```bash
npm install three @react-three/fiber @react-three/drei @types/three
```

**Step 2: Verify installation**

```bash
npm list three @react-three/fiber
```

**Step 3: Commit**

```bash
cd web-app
git add package.json package-lock.json
git commit -m "deps: add Three.js and React Three Fiber"
```

---

## Phase 3: Build Graph Canvas

### Task 3: Implement interactive graph canvas

**Files:**
- Modify: `components/graph/GraphVisualization.tsx`
- Create: `components/graph/GraphCanvas.tsx`

*This task would involve creating a Three.js scene with nodes and edges, implementing zoom/pan controls, and handling node selection. This is complex and would require multiple commits.*

---

## Phase 4: Testing & Validation

### Task 4: Test graph visualization page

**Steps:**
1. Run dev server
2. Navigate to /graphs
3. Verify 3-panel layout
4. Test node selection
5. Test properties panel updates

---

## Summary

**Total Tasks:** 4  
**Estimated Time:** 2-3 hours (for full Three.js implementation)  
**Deliverables:**
- ✅ 3-panel graph visualization layout
- ✅ Interactive nodes list with search/filter
- ✅ Properties panel with node details
- ✅ Three.js graph canvas (basic structure)
- ✅ Responsive design

---

**Next Phase:** Search page implementation (similar structure, simpler components)
