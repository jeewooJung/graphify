// Base API client with error handling

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>
}

interface ApiResponse<T> {
  data: T
  error?: string
  status: number
}

const API_BASE_URL = '/api/backend'

function extractErrorMessage(data: unknown, status: number): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    return data.message
  }

  return `API Error: ${status}`
}

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
      credentials: 'include',
    })

    const contentType = response.headers.get('content-type') || ''
    const data: unknown = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      return {
        data: null as unknown as T,
        error: extractErrorMessage(data, response.status),
        status: response.status,
      }
    }

    return {
      data: data as T,
      status: response.status,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error'
    return {
      data: null as unknown as T,
      error: message,
      status: 0,
    }
  }
}

// Convenience methods
export const api = {
  get: <T,>(endpoint: string) => apiCall<T>(endpoint, { method: 'GET' }),
  post: <T, TBody = unknown>(endpoint: string, body: TBody) =>
    apiCall<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T, TBody = unknown>(endpoint: string, body: TBody) =>
    apiCall<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T,>(endpoint: string) => apiCall<T>(endpoint, { method: 'DELETE' }),
}
