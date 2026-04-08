# Backend API Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect frontend to backend API for real graph data, search results, and node details

**Architecture:**
- API client utilities (fetch wrapper with error handling)
- Graph data service (nodes, edges, relationships)
- Search service (query backend for results)
- Node details service (fetch individual node data)
- Loading and error states throughout UI

**Tech Stack:**
- Fetch API (native HTTP client)
- Next.js API routes as middleware (optional)
- React hooks for data fetching (useState, useEffect)
- Error boundaries and loading states

---

## Phase 1: Create API Client Utilities

### Task 1: Create API client with error handling

**Files:**
- Create: `web-app/lib/api/client.ts`

**Step 1: Create API client**

```typescript
// Base API client with error handling

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>
}

interface ApiResponse<T> {
  data: T
  error?: string
  status: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for auth
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        data: null as any,
        error: data.message || `API Error: ${response.status}`,
        status: response.status,
      }
    }

    return {
      data,
      status: response.status,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error'
    return {
      data: null as any,
      error: message,
      status: 0,
    }
  }
}

// Convenience methods
export const api = {
  get: <T,>(endpoint: string) => apiCall<T>(endpoint, { method: 'GET' }),
  post: <T,>(endpoint: string, body: any) =>
    apiCall<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T,>(endpoint: string, body: any) =>
    apiCall<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T,>(endpoint: string) => apiCall<T>(endpoint, { method: 'DELETE' }),
}
```

---

### Task 2: Create graph data service

**Files:**
- Create: `web-app/lib/api/graph-service.ts`

**Step 1: Create graph service**

```typescript
import { api } from './client'

export interface GraphNode {
  id: string
  name: string
  type: 'entity' | 'concept' | 'relation'
  description?: string
  color?: string
  properties?: Record<string, any>
  connections?: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface Graph {
  id: string
  name: string
  description: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  nodeCount: number
  edgeCount: number
  lastUpdated: string
}

export const graphService = {
  // Get all graphs (for dashboard/listing)
  async getGraphs() {
    return api.get<Graph[]>('/graphs')
  },

  // Get specific graph by ID
  async getGraph(graphId: string) {
    return api.get<Graph>(`/graphs/${graphId}`)
  },

  // Get nodes for a graph
  async getNodes(graphId: string) {
    return api.get<GraphNode[]>(`/graphs/${graphId}/nodes`)
  },

  // Get node details
  async getNode(graphId: string, nodeId: string) {
    return api.get<GraphNode>(`/graphs/${graphId}/nodes/${nodeId}`)
  },

  // Get edges for a graph
  async getEdges(graphId: string) {
    return api.get<GraphEdge[]>(`/graphs/${graphId}/edges`)
  },

  // Create new node
  async createNode(graphId: string, nodeData: Partial<GraphNode>) {
    return api.post<GraphNode>(`/graphs/${graphId}/nodes`, nodeData)
  },

  // Update node
  async updateNode(graphId: string, nodeId: string, nodeData: Partial<GraphNode>) {
    return api.put<GraphNode>(`/graphs/${graphId}/nodes/${nodeId}`, nodeData)
  },

  // Delete node
  async deleteNode(graphId: string, nodeId: string) {
    return api.delete<{ success: boolean }>(`/graphs/${graphId}/nodes/${nodeId}`)
  },
}
```

---

### Task 3: Create search service

**Files:**
- Create: `web-app/lib/api/search-service.ts`

**Step 1: Create search service**

```typescript
import { api } from './client'

export interface SearchResult {
  id: string
  title: string
  description: string
  type: 'entity' | 'concept' | 'relation' | 'graph'
  connections?: number
  lastUpdated?: string
  color?: string
  graphId?: string
}

export const searchService = {
  // Global search across all graphs
  async search(query: string, filters?: {
    type?: string
    graphId?: string
    limit?: number
  }) {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.graphId) params.append('graphId', filters.graphId)
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const endpoint = `/search?${params.toString()}`
    return api.get<SearchResult[]>(endpoint)
  },

  // Search nodes in specific graph
  async searchNodes(graphId: string, query: string) {
    const params = new URLSearchParams()
    if (query) params.append('q', query)

    const endpoint = `/graphs/${graphId}/search?${params.toString()}`
    return api.get<SearchResult[]>(endpoint)
  },

  // Get recent searches (for suggestions)
  async getRecentSearches() {
    return api.get<string[]>('/search/recent')
  },
}
```

---

## Phase 2: Update Components to Use API

### Task 4: Update SearchResults to use real data

**Files:**
- Modify: `web-app/app/search/page.tsx`

**Step 1: Update search page to use API**

```typescript
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { SearchBar, SearchResults } from '@/components/search'
import { searchService } from '@/lib/api/search-service'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'entity' | 'concept' | 'relation' | 'graph'
  connections?: number
  lastUpdated?: string
  color?: string
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch search results when query or filters change
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery && !selectedType) {
        setResults([])
        return
      }

      setLoading(true)
      setError('')

      const response = await searchService.search(searchQuery, {
        type: selectedType || undefined,
      })

      if (response.error) {
        setError(response.error)
        setResults([])
      } else {
        setResults(response.data || [])
      }

      setLoading(false)
    }

    // Debounce search
    const timer = setTimeout(fetchResults, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedType])

  return (
    <div style={{ backgroundColor: '#ffffff' }} className="min-h-screen">
      {/* Header Section */}
      <div style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }} className="px-8 py-6">
        <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-semibold mb-2">
          Search
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Find nodes, graphs, and relationships across your knowledge base
        </p>
      </div>

      {/* Search Section */}
      <div className="px-8 py-8">
        <div className="max-w-3xl mb-8">
          <SearchBar
            onSearch={setSearchQuery}
            onFilterChange={setSelectedType}
          />
        </div>

        {/* Results Section */}
        <div className="max-w-4xl">
          {error && (
            <div style={{ backgroundColor: '#fee2e2', borderColor: '#fecaca', color: 'var(--color-error)' }} className="p-4 rounded mb-4 border">
              {error}
            </div>
          )}

          {searchQuery || selectedType ? (
            <>
              <p style={{ color: 'var(--color-text-tertiary)' }} className="text-sm mb-4">
                {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
              </p>
              <SearchResults
                results={results}
                loading={loading}
                query={searchQuery}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <p style={{ color: 'var(--color-text-tertiary)' }}>
                Start typing to search across your knowledge base
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

### Task 5: Update GraphVisualization to use real data

**Files:**
- Modify: `web-app/components/graph/GraphCanvas.tsx`

**Step 1: Update GraphCanvas to accept real data**

```typescript
'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { graphService } from '@/lib/api/graph-service'

interface GraphNode {
  id: string
  x: number
  y: number
  z: number
  color: string
  size: number
}

interface GraphEdge {
  source: string
  target: string
}

interface GraphCanvasProps {
  graphId?: string
  selectedNodeId?: string
  onSelectNode?: (id: string) => void
}

export function GraphCanvas({ graphId, selectedNodeId, onSelectNode }: GraphCanvasProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch graph data
  useEffect(() => {
    if (!graphId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError('')

      // Fetch nodes
      const nodesResponse = await graphService.getNodes(graphId)
      if (nodesResponse.error) {
        setError(nodesResponse.error)
        setLoading(false)
        return
      }

      // Transform API data to Three.js format
      const transformedNodes = (nodesResponse.data || []).map((node: any, index: number) => ({
        id: node.id,
        x: Math.cos((index / 5) * Math.PI * 2) * 3,
        y: Math.sin((index / 5) * Math.PI * 2) * 3,
        z: Math.random() - 0.5,
        color: node.color || '#3366cc',
        size: 0.8 + Math.random() * 0.4,
      }))

      setNodes(transformedNodes)

      // Fetch edges
      const edgesResponse = await graphService.getEdges(graphId)
      if (!edgesResponse.error) {
        setEdges(edgesResponse.data || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [graphId])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <p style={{ color: 'var(--color-text-tertiary)' }}>Loading graph...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <p style={{ color: 'var(--color-error)' }}>Error: {error}</p>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <p style={{ color: 'var(--color-text-tertiary)' }}>No data available</p>
      </div>
    )
  }

  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />

      {/* Render edges */}
      {edges.map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source)
        const targetNode = nodes.find(n => n.id === edge.target)
        if (!sourceNode || !targetNode) return null

        return (
          <line key={`${edge.source}-${edge.target}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  sourceNode.x, sourceNode.y, sourceNode.z,
                  targetNode.x, targetNode.y, targetNode.z,
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#d1d5db" linewidth={1} />
          </line>
        )
      })}

      {/* Render nodes */}
      {nodes.map(node => (
        <mesh
          key={node.id}
          position={[node.x, node.y, node.z]}
          onClick={() => onSelectNode?.(node.id)}
        >
          <sphereGeometry args={[node.size, 32, 32]} />
          <meshStandardMaterial
            color={node.color}
            emissive={selectedNodeId === node.id ? node.color : '#000000'}
            emissiveIntensity={selectedNodeId === node.id ? 0.5 : 0}
            wireframe={selectedNodeId === node.id}
          />
        </mesh>
      ))}

      <OrbitControls
        minDistance={5}
        maxDistance={50}
      />
    </Canvas>
  )
}
```

---

### Task 6: Verify and commit

**Files:**
- Verify: All new API client files
- Verify: Updated components

**Step 1: Commit**

```bash
cd web-app
git add lib/api/ app/search/page.tsx components/graph/GraphCanvas.tsx
git commit -m "feat: add API client utilities and integrate real data fetching"
```

**Step 2: Test in dev server**

```bash
npm run dev
# Verify search works with API (or fallback to mock)
# Verify graph loads with real data (or fallback to mock)
# Check error handling
```

---

## Summary

**Total Tasks:** 6  
**Estimated Time:** 1-2 hours  
**Deliverables:**
- ✅ API client with error handling
- ✅ Graph data service
- ✅ Search service
- ✅ Updated SearchResults with real data
- ✅ Updated GraphCanvas with real data
- ✅ Loading and error states

---

**Configuration:**

Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

**Next Phase:** Add more pages (Team, Projects, Permissions)
