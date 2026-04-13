'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui'
import { documentService, runWithConcurrency } from '@/lib/api/document-service'
import { pollJob } from '@/lib/api/job-service'
import { FileDropzone } from './FileDropzone'
import { UploadFileList } from './UploadFileList'
import {
  buildMetadataRecord,
  computeUploadResult,
  createInitialMetadata,
  createInitialProgress,
  mergeMetadata,
  validateUploadFiles,
} from './uploadDrawerHelpers'
import { UploadMetadataForm } from './UploadMetadataForm'
import { UploadProgressList } from './UploadProgressList'
import { UploadResultSummary } from './UploadResultSummary'
import { UploadValidationList } from './UploadValidationList'
import { matchesAccept, uniqueTags } from './uploadUtils'
import type {
  DocumentMetadataInput,
  FileCandidate,
  UploadProgress,
  UploadResult,
  UploadValidation,
} from '@/types/document'

type UploadDrawerStep = 'select' | 'validate' | 'metadata' | 'submitting' | 'result'

type UploadDrawerProps = {
  isOpen: boolean
  projectId: string
  initialFiles?: File[]
  onClose: () => void
  onUploaded: (result: UploadResult) => void
}

const STEPS: UploadDrawerStep[] = ['select', 'validate', 'metadata', 'submitting', 'result']
const ACCEPT = [
  '.pdf',
  '.md',
  '.docx',
  '.txt',
  'application/pdf',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]
const MAX_SIZE_BYTES = 50 * 1024 * 1024

function toFileCandidate(file: File): FileCandidate {
  const fallbackId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : fallbackId,
    file,
    sizeBytes: file.size,
    mimeType: file.type,
  }
}

export function UploadDrawer({
  isOpen,
  projectId,
  initialFiles,
  onClose,
  onUploaded,
}: UploadDrawerProps) {
  const [step, setStep] = useState<UploadDrawerStep>('select')
  const [files, setFiles] = useState<FileCandidate[]>([])
  const [metadataByFile, setMetadataByFile] = useState<Record<string, DocumentMetadataInput>>({})
  const [validations, setValidations] = useState<UploadValidation[]>([])
  const [progressByFile, setProgressByFile] = useState<Record<string, UploadProgress>>({})
  const [abortControllersByFile, setAbortControllersByFile] = useState<Record<string, AbortController>>({})
  const [result, setResult] = useState<UploadResult | null>(null)
  const progressRef = useRef<Record<string, UploadProgress>>({})

  useEffect(() => {
    if (!isOpen) return

    const nextFiles = (initialFiles ?? []).map(toFileCandidate)
    setStep('select')
    setFiles(nextFiles)
    setMetadataByFile(buildMetadataRecord(nextFiles))
    setProgressByFile({})
    setAbortControllersByFile({})
    setResult(null)
    progressRef.current = {}
  }, [initialFiles, isOpen])

  useEffect(() => {
    setValidations(validateUploadFiles(files, ACCEPT, MAX_SIZE_BYTES, matchesAccept))
  }, [files])

  useEffect(() => {
    progressRef.current = progressByFile
  }, [progressByFile])

  useEffect(() => {
    if (step !== 'submitting' || files.length === 0) return
    if (!files.every((file) => abortControllersByFile[file.id])) return

    let disposed = false
    let progressSnapshot = progressRef.current

    const updateProgress = (
      fileId: string,
      updater: (current: UploadProgress) => UploadProgress
    ) => {
      if (disposed) return

      const target = progressSnapshot[fileId]
      if (!target) return

      progressSnapshot = {
        ...progressSnapshot,
        [fileId]: updater(target),
      }
      progressRef.current = progressSnapshot
      setProgressByFile(progressSnapshot)
    }

    void (async () => {
      const successIds: Record<string, { documentId: string; jobId: string }> = {}
      const failureReasons: Record<string, string> = {}

      await runWithConcurrency(files, 3, async (candidate) => {
        const controller = abortControllersByFile[candidate.id]
        if (!controller) {
          failureReasons[candidate.id] = 'missing_abort_controller'
          updateProgress(candidate.id, (current) => ({ ...current, state: 'FAILED' }))
          return
        }

        updateProgress(candidate.id, (current) => ({
          ...current,
          state: 'UPLOADING',
        }))

        try {
          const uploadResult = await documentService.uploadDocument(
            projectId,
            candidate.file,
            metadataByFile[candidate.id] ?? createInitialMetadata(candidate.file),
            {
              onProgress: (loaded, total) => {
                updateProgress(candidate.id, (current) => ({
                  ...current,
                  loadedBytes: loaded,
                  totalBytes: total || current.totalBytes,
                  state: 'UPLOADING',
                }))
              },
              signal: controller.signal,
            }
          )

          if (uploadResult.error) {
            failureReasons[candidate.id] = uploadResult.error
            updateProgress(candidate.id, (current) => ({
              ...current,
              state: 'FAILED',
            }))
            return
          }

          if (!uploadResult.data) {
            failureReasons[candidate.id] = 'invalid_upload_response'
            updateProgress(candidate.id, (current) => ({
              ...current,
              state: 'FAILED',
            }))
            return
          }

          updateProgress(candidate.id, (current) => ({
            ...current,
            loadedBytes: current.totalBytes,
            state: 'SERVER_PROCESSING',
          }))

          const pollResult = await pollJob(uploadResult.data.jobId, {
            intervalMs: 2000,
            timeoutMs: 300000,
            signal: controller.signal,
          })

          if (pollResult.status === 'COMPLETED') {
            successIds[candidate.id] = {
              documentId: uploadResult.data.documentId,
              jobId: uploadResult.data.jobId,
            }

            updateProgress(candidate.id, (current) => ({
              ...current,
              loadedBytes: current.totalBytes,
              state: 'SUCCEEDED',
            }))
            return
          }

          if (pollResult.status === 'ABORTED') {
            updateProgress(candidate.id, (current) => ({
              ...current,
              state: 'CANCELLED',
            }))
            return
          }

          failureReasons[candidate.id] = pollResult.status === 'TIMEOUT'
            ? 'timeout'
            : (pollResult.error ?? 'polling_failed')

          updateProgress(candidate.id, (current) => ({
            ...current,
            state: 'FAILED',
          }))
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            updateProgress(candidate.id, (current) => ({
              ...current,
              state: 'CANCELLED',
            }))
            return
          }

          failureReasons[candidate.id] = error instanceof Error ? error.message : 'upload_failed'
          updateProgress(candidate.id, (current) => ({
            ...current,
            state: 'FAILED',
          }))
        }
      })

      if (disposed) return

      const nextResult = computeUploadResult(progressSnapshot, successIds, failureReasons)
      setAbortControllersByFile({})
      setResult(nextResult)
      setStep('result')
      onUploaded(nextResult)
    })()

    return () => {
      disposed = true
      Object.values(abortControllersByFile).forEach((controller) => controller.abort())
    }
  }, [abortControllersByFile, files, metadataByFile, onUploaded, projectId, step])

  const hasValidationErrors = useMemo(
    () => validations.some((validation) => validation.severity === 'error'),
    [validations]
  )

  const handleFilesSelected = (selectedFiles: File[]) => {
    const nextFiles = selectedFiles.map(toFileCandidate)
    if (nextFiles.length === 0) return

    setFiles((current) => [...current, ...nextFiles])
    setMetadataByFile((current) => ({
      ...current,
      ...Object.fromEntries(nextFiles.map((file) => [file.id, createInitialMetadata(file.file)])),
    }))
  }

  const handleRemoveFile = (fileId: string) => {
    setFiles((current) => current.filter((file) => file.id !== fileId))
    setMetadataByFile((current) => {
      const { [fileId]: _removed, ...rest } = current
      return rest
    })
    setValidations((current) => current.filter((validation) => validation.fileId !== fileId))
    setProgressByFile((current) => {
      const { [fileId]: _removed, ...rest } = current
      return rest
    })
    setAbortControllersByFile((current) => {
      current[fileId]?.abort?.()
      const { [fileId]: _removed, ...rest } = current
      return rest
    })
  }

  const handleCancelFile = (fileId: string) => {
    abortControllersByFile[fileId]?.abort?.()
  }

  const handleBulkApply = (partial: Partial<DocumentMetadataInput>) => {
    setMetadataByFile((current) =>
      Object.fromEntries(
        files.map((file) => [
          file.id,
          mergeMetadata(current[file.id] ?? createInitialMetadata(file.file), partial, uniqueTags),
        ])
      )
    )
  }

  const handleSubmit = () => {
    const nextProgress = createInitialProgress(files)
    progressRef.current = nextProgress
    setAbortControllersByFile(
      Object.fromEntries(files.map((file) => [file.id, new AbortController()]))
    )
    setProgressByFile(nextProgress)
    setResult(null)
    setStep('submitting')
  }

  const handleRetryFailed = () => {
    const failedIds = new Set(result?.failed.map((item) => item.fileId) ?? [])
    const retryFiles = files.filter((file) => failedIds.has(file.id) && file.file)
    if (retryFiles.length === 0) return

    setFiles(retryFiles)
    setMetadataByFile((current) => buildMetadataRecord(retryFiles, current))
    setProgressByFile({})
    setAbortControllersByFile({})
    setResult(null)
    progressRef.current = {}
    setStep('metadata')
  }

  const requestClose = () => {
    if ((step === 'metadata' || step === 'submitting')
      && !window.confirm('Upload is in progress. Close anyway?')) {
      return
    }
    onClose()
  }

  const goBack = () => {
    if (step === 'validate') setStep('select')
    if (step === 'metadata') setStep('validate')
  }

  const goNext = () => {
    if (step === 'select' && files.length > 0) setStep('validate')
    if (step === 'validate' && !hasValidationErrors) setStep('metadata')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close upload drawer"
        onClick={requestClose}
      />

      <div className="absolute inset-y-0 right-0 flex w-full justify-end">
        <section className="flex h-full w-full flex-col border-l border-slate-200 bg-white shadow-xl md:w-[480px]">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Upload to {projectId}</p>
              <p className="text-xs text-slate-500">Add files, validate, tag, and simulate upload progress.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={requestClose}>
              Close
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <ol className="mb-6 flex items-center justify-between gap-2" aria-label="Upload steps">
              {STEPS.map((item, index) => {
                const isActive = item === step
                const isComplete = STEPS.indexOf(step) > index
                return (
                  <li key={item} className="flex flex-1 items-center gap-2">
                    <span
                      className={[
                        'h-2.5 w-2.5 rounded-full transition-colors',
                        isActive ? 'bg-slate-900' : isComplete ? 'bg-slate-500' : 'bg-slate-200',
                      ].join(' ')}
                    />
                    {index < STEPS.length - 1 ? <span className="h-px flex-1 bg-slate-200" /> : null}
                  </li>
                )
              })}
            </ol>

            <div className="space-y-4" data-step={step}>
              {step === 'select' ? (
                <>
                  <FileDropzone accept={ACCEPT} maxSizeBytes={MAX_SIZE_BYTES} onFiles={handleFilesSelected} />
                  <UploadFileList files={files} onRemove={handleRemoveFile} />
                </>
              ) : null}

              {step === 'validate' ? (
                <UploadValidationList validations={validations} onDismissFile={handleRemoveFile} />
              ) : null}

              {step === 'metadata' ? (
                <UploadMetadataForm
                  files={files}
                  values={metadataByFile}
                  availableTags={[]}
                  onChange={(fileId, next) => setMetadataByFile((current) => ({ ...current, [fileId]: next }))}
                  onBulkApply={handleBulkApply}
                />
              ) : null}

              {step === 'submitting' ? (
                <UploadProgressList files={files} progressByFile={progressByFile} onCancel={handleCancelFile} />
              ) : null}

              {step === 'result' && result ? (
                <UploadResultSummary result={result} onRetryFailed={handleRetryFailed} onGoToDocuments={onClose} onClose={onClose} />
              ) : null}
            </div>
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
            {step === 'select' ? (
              <Button onClick={goNext} disabled={files.length === 0}>
                Next
              </Button>
            ) : null}

            {step === 'validate' ? (
              <>
                <Button variant="secondary" onClick={goBack}>
                  Back
                </Button>
                <Button onClick={goNext} disabled={hasValidationErrors}>
                  Next
                </Button>
              </>
            ) : null}

            {step === 'metadata' ? (
              <>
                <Button variant="secondary" onClick={goBack}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={files.length === 0}>
                  Submit
                </Button>
              </>
            ) : null}

            {step === 'submitting' ? (
              <Button
                variant="secondary"
                onClick={() => {
                  Object.values(progressByFile)
                    .filter((progress) => progress.state !== 'SUCCEEDED' && progress.state !== 'FAILED' && progress.state !== 'CANCELLED')
                    .forEach((progress) => handleCancelFile(progress.fileId))
                }}
              >
                Cancel all
              </Button>
            ) : null}

          </footer>
        </section>
      </div>
    </div>
  )
}
