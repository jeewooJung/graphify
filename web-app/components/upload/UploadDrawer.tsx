'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui'
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

function toFileCandidate(file: File): FileCandidate {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
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

  useEffect(() => {
    if (!isOpen) return

    const nextFiles = (initialFiles ?? []).map(toFileCandidate)
    setStep('select')
    setFiles(nextFiles)
    setMetadataByFile(
      Object.fromEntries(nextFiles.map((file) => [file.id, { tags: [] } satisfies DocumentMetadataInput]))
    )
    setValidations([])
    setProgressByFile({})
    setAbortControllersByFile({})
    setResult(null)
  }, [initialFiles, isOpen])

  useEffect(() => {
    if (step !== 'submitting') return

    const timeoutId = window.setTimeout(() => {
      const nextResult: UploadResult = { succeeded: [], failed: [], cancelled: [] }
      setResult(nextResult)
      setStep('result')
      onUploaded(nextResult)
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [onUploaded, step])

  const hasValidationErrors = useMemo(
    () => validations.some((validation) => validation.severity === 'error'),
    [validations]
  )
  const metadataCount = Object.keys(metadataByFile).length
  const progressCount = Object.keys(progressByFile).length
  const controllerCount = Object.keys(abortControllersByFile).length
  const resultCount = result
    ? result.succeeded.length + result.failed.length + result.cancelled.length
    : 0

  const requestClose = () => {
    if ((step === 'metadata' || step === 'submitting')
      && !window.confirm('Upload in progress — close anyway?')) {
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
        <section
          className="flex h-full w-full flex-col border-l border-slate-200 bg-white shadow-xl md:w-[480px]"
          data-file-count={files.length}
          data-metadata-count={metadataCount}
          data-progress-count={progressCount}
          data-controller-count={controllerCount}
          data-result-count={resultCount}
        >
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Upload to {projectId}</p>
              <p className="text-xs text-slate-500">Stage 5 shell only</p>
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

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
              <div data-step={step} className="text-sm font-medium capitalize text-slate-700">
                {step}
              </div>
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
                <Button onClick={() => setStep('submitting')} disabled={files.length > 0 && metadataCount < files.length}>
                  Submit
                </Button>
              </>
            ) : null}

            {step === 'submitting' ? (
              <Button variant="secondary" onClick={() => {}}>
                Cancel all
              </Button>
            ) : null}

            {step === 'result' ? (
              <>
                <Button variant="secondary" onClick={() => {}}>
                  Retry failed
                </Button>
                <Button onClick={onClose}>
                  Go to documents
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </>
            ) : null}
          </footer>
        </section>
      </div>
    </div>
  )
}
