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
