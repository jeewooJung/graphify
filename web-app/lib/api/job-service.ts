type JobRecord = {
  id: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  error?: string
  updatedAt: string
}

type GetJobResult = {
  data?: JobRecord
  error?: string
}

function extractMessage(body: unknown): string | undefined {
  if (typeof body === 'string') {
    return body.trim() || undefined
  }

  if (!body || typeof body !== 'object') {
    return undefined
  }

  const value = body as { message?: unknown; error?: unknown }
  if (typeof value.message === 'string' && value.message.trim()) {
    return value.message
  }

  if (typeof value.error === 'string' && value.error.trim()) {
    return value.error
  }

  return undefined
}

function normalizeJobRecord(body: unknown): JobRecord | undefined {
  if (!body || typeof body !== 'object') {
    return undefined
  }

  const candidate = 'data' in body && body.data && typeof body.data === 'object'
    ? body.data
    : body

  if (!candidate || typeof candidate !== 'object') {
    return undefined
  }

  const job = candidate as {
    id?: unknown
    status?: unknown
    error?: unknown
    updatedAt?: unknown
  }

  if (
    typeof job.id !== 'string'
    || (job.status !== 'PENDING'
      && job.status !== 'RUNNING'
      && job.status !== 'COMPLETED'
      && job.status !== 'FAILED')
    || typeof job.updatedAt !== 'string'
  ) {
    return undefined
  }

  return {
    id: job.id,
    status: job.status,
    error: typeof job.error === 'string' ? job.error : undefined,
    updatedAt: job.updatedAt,
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

function waitForNextPoll(intervalMs: number, signal?: AbortSignal): Promise<'elapsed' | 'aborted'> {
  if (signal?.aborted) {
    return Promise.resolve('aborted')
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve('elapsed')
    }, intervalMs)

    const handleAbort = () => {
      clearTimeout(timeoutId)
      resolve('aborted')
    }

    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}

export const jobService = {
  async getJob(jobId: string): Promise<GetJobResult> {
    try {
      const response = await fetch(`/api/backend/jobs/${encodeURIComponent(jobId)}`, {
        method: 'GET',
        credentials: 'include',
      })

      const body = await parseResponseBody(response)

      if (!response.ok) {
        return {
          error: extractMessage(body) || response.statusText || `API Error: ${response.status}`,
        }
      }

      const data = normalizeJobRecord(body)

      if (!data) {
        return {
          error: 'Invalid response',
        }
      }

      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  },
}

export async function pollJob(
  jobId: string,
  opts: { intervalMs?: number; timeoutMs?: number; signal?: AbortSignal }
): Promise<{ status: 'COMPLETED' | 'FAILED' | 'TIMEOUT' | 'ABORTED'; jobId: string; error?: string }> {
  const intervalMs = opts.intervalMs ?? 2000
  const timeoutMs = opts.timeoutMs ?? 300000
  const startedAt = Date.now()
  let consecutiveErrors = 0

  while (true) {
    if (opts.signal?.aborted) {
      return { status: 'ABORTED', jobId }
    }

    if (Date.now() - startedAt > timeoutMs) {
      return { status: 'TIMEOUT', jobId }
    }

    const result = await jobService.getJob(jobId)

    if (opts.signal?.aborted) {
      return { status: 'ABORTED', jobId }
    }

    if (result.data) {
      consecutiveErrors = 0

      if (result.data.status === 'COMPLETED' || result.data.status === 'FAILED') {
        return {
          status: result.data.status,
          jobId,
          error: result.data.error,
        }
      }
    } else if (result.error) {
      consecutiveErrors += 1
      console.warn(`[pollJob] ${jobId}: ${result.error}`)

      if (consecutiveErrors >= 3) {
        return {
          status: 'FAILED',
          jobId,
          error: 'polling_failed',
        }
      }
    }

    if (Date.now() - startedAt > timeoutMs) {
      return { status: 'TIMEOUT', jobId }
    }

    const waitStatus = await waitForNextPoll(intervalMs, opts.signal)

    if (waitStatus === 'aborted') {
      return { status: 'ABORTED', jobId }
    }
  }
}
