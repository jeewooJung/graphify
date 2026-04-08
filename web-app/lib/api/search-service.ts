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
