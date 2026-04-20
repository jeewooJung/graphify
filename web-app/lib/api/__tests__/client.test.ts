import { api, apiCall } from '../client'

describe('API Client', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('apiCall', () => {
    it('should make a GET request successfully', async () => {
      const mockData = { data: 'test' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (key: string) =>
            key === 'content-type' ? 'application/json' : null,
        },
        json: async () => mockData,
      })

      const result = await apiCall('/test', { method: 'GET' })

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeUndefined()
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Not found'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: {
          get: (key: string) =>
            key === 'content-type' ? 'application/json' : null,
        },
        json: async () => ({ message: errorMessage }),
      })

      const result = await apiCall('/test', { method: 'GET' })

      expect(result.error).toBe(errorMessage)
      expect(result.data).toBeNull()
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const result = await apiCall('/test', { method: 'GET' })

      expect(result.error).toBe('Network error')
      expect(result.status).toBe(0)
    })
  })

  describe('api helpers', () => {
    it('should call apiCall with correct method for GET', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (key: string) =>
            key === 'content-type' ? 'application/json' : null,
        },
        json: async () => ({}),
      })

      await api.get('/test')

      const call = (global.fetch as jest.Mock).mock.calls[0]
      expect(call[1].method).toBe('GET')
    })

    it('should call apiCall with correct method for POST', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (key: string) =>
            key === 'content-type' ? 'application/json' : null,
        },
        json: async () => ({}),
      })

      await api.post('/test', { data: 'test' })

      const call = (global.fetch as jest.Mock).mock.calls[0]
      expect(call[1].method).toBe('POST')
    })

    it('should call apiCall with correct method for PUT', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (key: string) =>
            key === 'content-type' ? 'application/json' : null,
        },
        json: async () => ({}),
      })

      await api.put('/test', { data: 'test' })

      const call = (global.fetch as jest.Mock).mock.calls[0]
      expect(call[1].method).toBe('PUT')
    })

    it('should call apiCall with correct method for DELETE', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (key: string) =>
            key === 'content-type' ? 'application/json' : null,
        },
        json: async () => ({}),
      })

      await api.delete('/test')

      const call = (global.fetch as jest.Mock).mock.calls[0]
      expect(call[1].method).toBe('DELETE')
    })
  })
})
