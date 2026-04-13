import type {
  DocumentMetadataInput,
  FileCandidate,
  UploadProgress,
  UploadResult,
  UploadValidation,
} from '@/types/document'

export function inferFromExtension(filename: string): string | undefined {
  const extension = getExtension(filename)

  if (extension === '.pdf') return 'PDF'
  if (extension === '.md') return 'MARKDOWN'
  if (extension === '.docx') return 'DOCX'
  if (extension === '.txt') return 'TXT'

  return undefined
}

export function getFilenameStem(filename: string): string {
  const dotIndex = filename.lastIndexOf('.')
  return dotIndex > 0 ? filename.slice(0, dotIndex) : filename
}

export function createInitialMetadata(file: File): DocumentMetadataInput {
  return {
    title: getFilenameStem(file.name),
    tags: [],
    docType: inferFromExtension(file.name),
  }
}

export function buildMetadataRecord(
  files: FileCandidate[],
  previous: Record<string, DocumentMetadataInput> = {}
): Record<string, DocumentMetadataInput> {
  return Object.fromEntries(
    files.map((file) => [file.id, previous[file.id] ?? createInitialMetadata(file.file)])
  )
}

export function validateUploadFiles(
  files: FileCandidate[],
  accept: string[],
  maxSizeBytes: number,
  matchesAccept: (file: File, acceptRules: string[]) => boolean
): UploadValidation[] {
  const filenameCounts = files.reduce<Record<string, number>>((counts, candidate) => {
    const key = candidate.file.name.toLowerCase()
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})

  return files.flatMap((candidate) => {
    const nextValidations: UploadValidation[] = []

    if (!matchesAccept(candidate.file, accept)) {
      nextValidations.push({
        fileId: candidate.id,
        severity: 'error',
        code: 'unsupported_type',
        message: `${candidate.file.name} is not an accepted file type.`,
      })
    }

    if (candidate.sizeBytes > maxSizeBytes) {
      nextValidations.push({
        fileId: candidate.id,
        severity: 'error',
        code: 'too_large',
        message: `${candidate.file.name} exceeds the 50 MB upload limit.`,
      })
    }

    if ((filenameCounts[candidate.file.name.toLowerCase()] ?? 0) > 1) {
      nextValidations.push({
        fileId: candidate.id,
        severity: 'warn',
        code: 'duplicate_filename',
        message: `${candidate.file.name} appears more than once in this batch.`,
      })
    }

    return nextValidations
  })
}

export function createInitialProgress(files: FileCandidate[]): Record<string, UploadProgress> {
  return Object.fromEntries(
    files.map((file) => [
      file.id,
      {
        fileId: file.id,
        loadedBytes: 0,
        totalBytes: file.sizeBytes,
        state: 'PENDING',
      } satisfies UploadProgress,
    ])
  )
}

export function isTerminalUploadState(state: UploadProgress['state']): boolean {
  return state === 'SUCCEEDED' || state === 'FAILED' || state === 'CANCELLED'
}

export function advanceUploadProgress(
  progressByFile: Record<string, UploadProgress>,
  processingTicks: Record<string, number>,
  randomFn: () => number = Math.random
): {
  progressByFile: Record<string, UploadProgress>
  processingTicks: Record<string, number>
  allTerminal: boolean
} {
  const nextTicks: Record<string, number> = {}
  let allTerminal = true

  const nextProgress = Object.fromEntries(
    Object.entries(progressByFile).map(([fileId, progress]) => {
      let next = progress

      if (progress.state === 'PENDING') {
        next = { ...progress, state: 'UPLOADING' }
      } else if (progress.state === 'UPLOADING') {
        const nextLoadedBytes = Math.min(
          progress.totalBytes,
          progress.loadedBytes + Math.max(1, progress.totalBytes / 10)
        )

        next = nextLoadedBytes >= progress.totalBytes
          ? { ...progress, loadedBytes: progress.totalBytes, state: 'SERVER_PROCESSING' }
          : { ...progress, loadedBytes: nextLoadedBytes }
      } else if (progress.state === 'SERVER_PROCESSING') {
        const tickCount = (processingTicks[fileId] ?? 0) + 1
        nextTicks[fileId] = tickCount
        next = tickCount >= 1
          ? {
              ...progress,
              state: randomFn() <= 0.9 ? 'SUCCEEDED' : 'FAILED',
            }
          : progress
      }

      if (next.state === 'SERVER_PROCESSING') {
        nextTicks[fileId] = processingTicks[fileId] ?? 0
      }

      if (!isTerminalUploadState(next.state)) {
        allTerminal = false
      }

      return [fileId, next]
    })
  )

  return {
    progressByFile: nextProgress,
    processingTicks: nextTicks,
    allTerminal,
  }
}

export function computeUploadResult(
  progressByFile: Record<string, UploadProgress>,
  successIds: Record<string, { documentId: string; jobId: string }>,
  failureReasons: Record<string, string>
): UploadResult {
  const result: UploadResult = { succeeded: [], failed: [], cancelled: [] }

  Object.values(progressByFile).forEach((progress) => {
    if (progress.state === 'SUCCEEDED') {
      const success = successIds[progress.fileId]
      if (!success) {
        return
      }

      result.succeeded.push({
        fileId: progress.fileId,
        documentId: success.documentId,
        jobId: success.jobId,
      })
    }

    if (progress.state === 'FAILED') {
      result.failed.push({
        fileId: progress.fileId,
        reason: failureReasons[progress.fileId] ?? 'Upload failed.',
      })
    }

    if (progress.state === 'CANCELLED') {
      result.cancelled.push({ fileId: progress.fileId })
    }
  })

  return result
}

export function mergeMetadata(
  current: DocumentMetadataInput,
  partial: Partial<DocumentMetadataInput>,
  uniqueTags: (tags: string[]) => string[]
): DocumentMetadataInput {
  const next: DocumentMetadataInput = { ...current }

  if (partial.title?.trim()) next.title = partial.title.trim()
  if (partial.docType?.trim()) next.docType = partial.docType
  if (partial.tags && partial.tags.length > 0) {
    next.tags = uniqueTags([...(current.tags ?? []), ...partial.tags])
  }

  return next
}

function getExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.')
  return dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : ''
}
