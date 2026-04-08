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

// Sample data for when API is not available
const SAMPLE_NODES = [
  { id: '1', x: 0, y: 0, z: 0, color: '#3366cc', size: 1 },
  { id: '2', x: 3, y: 2, z: 1, color: '#10b981', size: 0.8 },
  { id: '3', x: -3, y: 2, z: 1, color: '#f59e0b', size: 0.8 },
  { id: '4', x: 0, y: -3, z: 0, color: '#8b5cf6', size: 0.9 },
  { id: '5', x: 2, y: -2, z: -2, color: '#ef4444', size: 0.7 },
]

const SAMPLE_EDGES = [
  { source: '1', target: '2' },
  { source: '1', target: '3' },
  { source: '1', target: '4' },
  { source: '2', target: '5' },
  { source: '3', target: '5' },
]

// Node component
function Node({ node, isSelected, onSelect }: { node: GraphNode; isSelected: boolean; onSelect: (id: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <mesh
      ref={meshRef}
      position={[node.x, node.y, node.z]}
      onClick={() => onSelect(node.id)}
      onPointerOver={() => {
        if (meshRef.current) {
          meshRef.current.scale.set(1.3, 1.3, 1.3)
        }
      }}
      onPointerOut={() => {
        if (meshRef.current) {
          meshRef.current.scale.set(1, 1, 1)
        }
      }}
    >
      <sphereGeometry args={[node.size, 32, 32]} />
      <meshStandardMaterial
        color={node.color}
        emissive={isSelected ? node.color : '#000000'}
        emissiveIntensity={isSelected ? 0.5 : 0}
        wireframe={isSelected}
      />
    </mesh>
  )
}

// Edges component
function Edges({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const lines = edges.map(edge => {
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
  })

  return <>{lines}</>
}

// Camera controller
function CameraController() {
  const { camera } = useThree()

  React.useEffect(() => {
    camera.position.z = 12
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

export function GraphCanvas({ graphId, selectedNodeId, onSelectNode }: GraphCanvasProps) {
  const [nodes, setNodes] = useState<GraphNode[]>(SAMPLE_NODES)
  const [edges, setEdges] = useState<GraphEdge[]>(SAMPLE_EDGES)
  const [loading, setLoading] = useState(!!graphId)
  const [error, setError] = useState('')

  // Fetch graph data from API
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
        x: Math.cos((index / Math.max(nodesResponse.data?.length || 5, 5)) * Math.PI * 2) * 3,
        y: Math.sin((index / Math.max(nodesResponse.data?.length || 5, 5)) * Math.PI * 2) * 3,
        z: Math.random() - 0.5,
        color: node.color || '#3366cc',
        size: 0.8 + Math.random() * 0.4,
      }))

      setNodes(transformedNodes.length > 0 ? transformedNodes : SAMPLE_NODES)

      // Fetch edges
      const edgesResponse = await graphService.getEdges(graphId)
      if (!edgesResponse.error) {
        setEdges(edgesResponse.data || SAMPLE_EDGES)
      }

      setLoading(false)
    }

    fetchData()
  }, [graphId])

  if (loading && graphId) {
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

  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
      <CameraController />
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />

      {/* Edges */}
      <Edges nodes={nodes} edges={edges} />

      {/* Nodes */}
      {nodes.map(node => (
        <Node
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          onSelect={() => onSelectNode?.(node.id)}
        />
      ))}

      {/* Controls */}
      <OrbitControls
        autoRotate={false}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />
    </Canvas>
  )
}
