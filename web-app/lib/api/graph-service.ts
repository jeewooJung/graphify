import { api } from './client'

export interface GraphNode {
  id: string
  name: string
  type: 'entity' | 'concept' | 'relation'
  description?: string
  color?: string
  properties?: Record<string, unknown>
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
