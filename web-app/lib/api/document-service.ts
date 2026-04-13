import { api } from '@/lib/api/client'
import {
  asRecord,
  buildDocumentQuery,
  mapDocumentChunk,
  mapDocumentDetail,
  mapDocumentSummary,
  resolveItems,
} from '@/lib/api/document-service.helpers'
import type {
  DocumentChunk,
  DocumentFilterState,
  DocumentMetadataInput,
  DocumentSummary,
} from '@/types/document'

type UploadDocumentResult = {
  data?: {
    documentId: string
    jobId: string
  }
  error?: string
}


function createAbortError() {
  if (typeof DOMException !== 'undefined') {
    return new DOMException('The operation was aborted.', 'AbortError')
  }

  const error = new Error('The operation was aborted.')
  error.name = 'AbortError'
  return error
}

function parseJsonBody(body: string) {
  if (!body) {
    return null
  }

  try {
    return JSON.parse(body) as {
      documentId?: string
      jobId?: string
      message?: string
    }
  } catch {
    return null
  }
}

export const documentService = {
  async getProjectDocuments(
    projectId: string,
    filter: Partial<DocumentFilterState> = {},
    options: { limit?: number; offset?: number; sort?: 'recent' | 'title' } = {}
  ) {
    const query = buildDocumentQuery(filter, options)
    const response = await api.get<unknown>(
      `/projects/${encodeURIComponent(projectId)}/documents${query ? `?${query}` : ''}`
    )

    if (response.error || !response.data) {
      return { ...response, data: [] as DocumentSummary[] }
    }

    return {
      ...response,
      data: resolveItems(response.data, ['documents', 'items', 'data']).map(mapDocumentSummary),
    }
  },

  async getDocument(documentId: string) {
    const response = await api.get<unknown>(`/documents/${encodeURIComponent(documentId)}`)
    if (response.error || !response.data) {
      return response
    }

    return {
      ...response,
      data: mapDocumentDetail(asRecord(response.data).document ?? response.data),
    }
  },

  async getDocumentChunks(documentId: string, options: { limit?: number } = {}) {
    const params = new URLSearchParams()
    if (typeof options.limit === 'number') {
      params.set('limit', String(options.limit))
    }

    const query = params.toString()
    const response = await api.get<unknown>(
      `/documents/${encodeURIComponent(documentId)}/chunks${query ? `?${query}` : ''}`
    )

    if (response.error || !response.data) {
      return { ...response, data: [] as DocumentChunk[] }
    }

    return {
      ...response,
      data: resolveItems(response.data, ['chunks', 'items', 'data']).map(mapDocumentChunk),
    }
  },

  async deleteDocument(documentId: string) {
    const response = await api.delete<unknown>(`/documents/${encodeURIComponent(documentId)}`)
    return response.error ? response : { ...response, data: true as const }
  },

  async uploadDocument(
    projectId: string,
    file: File,
    meta: DocumentMetadataInput,
    opts: {
      onProgress?: (loaded: number, total: number) => void
      signal?: AbortSignal
    }
  ): Promise<UploadDocumentResult> {
    if (opts.signal?.aborted) {
      throw createAbortError()
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', meta.title ?? file.name)
    formData.append('tags', JSON.stringify(meta.tags ?? []))
    formData.append('docType', meta.docType ?? '')

    return new Promise<UploadDocumentResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const url = `/api/backend/projects/${encodeURIComponent(projectId)}/documents`
      let settled = false

      const cleanup = () => {
        opts.signal?.removeEventListener('abort', handleAbort)
      }

      const resolveOnce = (result: UploadDocumentResult) => {
        if (settled) {
          return
        }

        settled = true
        cleanup()
        resolve(result)
      }

      const rejectOnce = (error: Error) => {
        if (settled) {
          return
        }

        settled = true
        cleanup()
        reject(error)
      }

      const handleAbort = () => {
        xhr.abort()
      }

      xhr.open('POST', url)
      xhr.withCredentials = true

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          opts.onProgress?.(event.loaded, event.total)
        }
      })

      xhr.onload = () => {
        const body = parseJsonBody(xhr.responseText)

        if (xhr.status >= 200 && xhr.status < 300) {
          if (body?.documentId && body?.jobId) {
            resolveOnce({
              data: {
                documentId: body.documentId,
                jobId: body.jobId,
              },
            })
            return
          }

          resolveOnce({
            error: 'Invalid response',
          })
          return
        }

        resolveOnce({
          error: body?.message || xhr.statusText || `API Error: ${xhr.status}`,
        })
      }

      xhr.onerror = () => {
        resolveOnce({
          error: 'Network error',
        })
      }

      xhr.onabort = () => {
        rejectOnce(createAbortError())
      }

      opts.signal?.addEventListener('abort', handleAbort, { once: true })
      xhr.send(formData)
    })
  },
}

export async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError('concurrency must be a positive integer')
  }

  const results = new Array<R>(items.length)
  let nextIndex = 0

  const runWorker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      results[currentIndex] = await worker(items[currentIndex], currentIndex)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runWorker()
  )

  await Promise.all(workers)
  return results
}
