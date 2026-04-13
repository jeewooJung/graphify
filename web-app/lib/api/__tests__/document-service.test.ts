import {
  documentService,
  runWithConcurrency,
} from '../document-service'
import type { DocumentMetadataInput } from '@/types/document'

type Expectation = {
  toEqual: (expected: unknown) => void
  toHaveBeenCalledWith: (...args: unknown[]) => void
  toHaveBeenCalledTimes: (count: number) => void
  toBeLessThanOrEqual: (value: number) => void
  rejects: {
    toMatchObject: (expected: Record<string, unknown>) => Promise<void>
  }
}

type MockFactory = <Args extends unknown[], ReturnValue>(
  implementation?: (...args: Args) => ReturnValue
) => ((...args: Args) => ReturnValue) & {
  mock: {
    calls: Args[]
  }
}

declare const afterEach: (fn: () => void) => void
declare const beforeEach: (fn: () => void) => void
declare const describe: (name: string, fn: () => void) => void
declare const expect: (value: unknown) => Expectation
declare const it: (name: string, fn: () => Promise<void> | void) => void
declare const jest: {
  clearAllMocks: () => void
  fn: MockFactory
}

type UploadProgressListener = (event: {
  lengthComputable: boolean
  loaded: number
  total: number
}) => void

class MockXMLHttpRequest {
  static instances: MockXMLHttpRequest[] = []

  upload = {
    addEventListener: jest.fn((type: string, listener: UploadProgressListener) => {
      if (type === 'progress') {
        this.progressListeners.push(listener)
      }
    }),
  }

  withCredentials = false
  status = 0
  statusText = ''
  responseText = ''
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  onabort: (() => void) | null = null
  open = jest.fn()
  send = jest.fn((body?: Document | XMLHttpRequestBodyInit | null) => {
    this.sentBody = body ?? null
    this.sendImpl?.()
  })
  abort = jest.fn(() => {
    this.onabort?.()
  })
  sentBody: Document | XMLHttpRequestBodyInit | null = null
  sendImpl?: () => void

  private progressListeners: UploadProgressListener[] = []

  constructor(sendImpl?: () => void) {
    this.sendImpl = sendImpl
    MockXMLHttpRequest.instances.push(this)
  }

  emitProgress(loaded: number, total: number) {
    for (const listener of this.progressListeners) {
      listener({
        lengthComputable: true,
        loaded,
        total,
      })
    }
  }

  emitLoad(status: number, responseText: string, statusText = 'OK') {
    this.status = status
    this.responseText = responseText
    this.statusText = statusText
    this.onload?.()
  }

  emitError() {
    this.onerror?.()
  }
}

describe('documentService', () => {
  const originalXMLHttpRequest = globalThis.XMLHttpRequest
  const defaultMeta: DocumentMetadataInput = {
    tags: ['spec'],
  }

  beforeEach(() => {
    MockXMLHttpRequest.instances = []
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      writable: true,
      value: originalXMLHttpRequest,
    })

    jest.clearAllMocks()
  })

  it('calls onProgress at least once during upload', async () => {
    const onProgress = jest.fn()
    const xhr = new MockXMLHttpRequest(() => {
      xhr.emitProgress(5, 10)
      xhr.emitLoad(200, '{"documentId":"d1","jobId":"j1"}')
    })

    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      writable: true,
      value: jest.fn(() => xhr),
    })

    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    const result = await documentService.uploadDocument(
      'project-1',
      file,
      defaultMeta,
      { onProgress }
    )

    expect(result).toEqual({
      data: {
        documentId: 'd1',
        jobId: 'j1',
      },
    })
    expect(onProgress).toHaveBeenCalledWith(5, 10)
    expect(xhr.open).toHaveBeenCalledWith(
      'POST',
      '/api/backend/projects/project-1/documents'
    )
  })

  it('rejects with an AbortError when aborted via signal', async () => {
    const controller = new AbortController()
    const xhr = new MockXMLHttpRequest()

    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      writable: true,
      value: jest.fn(() => xhr),
    })

    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    const uploadPromise = documentService.uploadDocument(
      'project-1',
      file,
      defaultMeta,
      { signal: controller.signal }
    )

    controller.abort()

    await expect(uploadPromise).rejects.toMatchObject({
      name: 'AbortError',
    })
    expect(xhr.abort).toHaveBeenCalledTimes(1)
  })
})

describe('runWithConcurrency', () => {
  it('does not exceed the configured concurrency and preserves result order', async () => {
    const items = [1, 2, 3, 4, 5, 6]
    const concurrency = 2
    let active = 0
    let maxActive = 0

    const results = await runWithConcurrency(items, concurrency, async (item) => {
      active += 1
      maxActive = Math.max(maxActive, active)

      await new Promise((resolve) => {
        setTimeout(resolve, 5)
      })

      active -= 1
      return item * 10
    })

    expect(maxActive).toBeLessThanOrEqual(concurrency)
    expect(results).toEqual([10, 20, 30, 40, 50, 60])
  })
})
