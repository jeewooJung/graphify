import { searchService } from '../search-service'
import * as client from '../client'

jest.mock('../client')

describe('Search Service', () => {
  const mockApiGet = jest.fn()

  beforeEach(() => {
    ;(client.api.get as jest.Mock) = mockApiGet
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('search', () => {
    it('should call API with correct endpoint and params', async () => {
      mockApiGet.mockResolvedValueOnce({ data: [] })

      await searchService.search('test', { type: 'entity' })

      const endpoint = mockApiGet.mock.calls[0][0]
      expect(endpoint).toContain('/search')
      expect(endpoint).toContain('q=test')
      expect(endpoint).toContain('type=entity')
    })

    it('should handle empty query', async () => {
      mockApiGet.mockResolvedValueOnce({ data: [] })

      await searchService.search('', {})

      const endpoint = mockApiGet.mock.calls[0][0]
      expect(endpoint).toContain('/search')
    })

    it('should return results', async () => {
      const mockResults = [
        {
          id: '1',
          title: 'Test',
          description: 'Test description',
          type: 'entity' as const,
        },
      ]
      mockApiGet.mockResolvedValueOnce({ data: mockResults })

      const result = await searchService.search('test')

      expect(result.data).toEqual(mockResults)
    })

    it('should include graphId filter when provided', async () => {
      mockApiGet.mockResolvedValueOnce({ data: [] })

      await searchService.search('test', { graphId: 'graph-123' })

      const endpoint = mockApiGet.mock.calls[0][0]
      expect(endpoint).toContain('graphId=graph-123')
    })

    it('should include limit when provided', async () => {
      mockApiGet.mockResolvedValueOnce({ data: [] })

      await searchService.search('test', { limit: 10 })

      const endpoint = mockApiGet.mock.calls[0][0]
      expect(endpoint).toContain('limit=10')
    })
  })

  describe('searchNodes', () => {
    it('should call API with correct endpoint for graph search', async () => {
      mockApiGet.mockResolvedValueOnce({ data: [] })

      await searchService.searchNodes('graph-123', 'node')

      const endpoint = mockApiGet.mock.calls[0][0]
      expect(endpoint).toContain('/graphs/graph-123/search')
      expect(endpoint).toContain('q=node')
    })
  })

  describe('getRecentSearches', () => {
    it('should call API with correct endpoint', async () => {
      mockApiGet.mockResolvedValueOnce({ data: ['search1', 'search2'] })

      const result = await searchService.getRecentSearches()

      const endpoint = mockApiGet.mock.calls[0][0]
      expect(endpoint).toBe('/search/recent')
      expect(result.data).toEqual(['search1', 'search2'])
    })
  })
})
