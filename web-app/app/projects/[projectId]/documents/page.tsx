'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/feedback'
import {
  DocumentFilters,
  DocumentList,
  DocumentSummaryPanel,
  EmptyDocumentsState,
  FailedDocumentNotice,
  PollingDisconnectedBanner,
  ProjectDocumentsHeader,
} from '@/components/documents'
import { UploadDrawer } from '@/components/upload/UploadDrawer'
import { documentService } from '@/lib/api/document-service'
import { projectService } from '@/lib/api/project-service'
import { useUser } from '@/lib/auth/user-context'
import type {
  DocumentChunk,
  DocumentDetail,
  DocumentFilterState,
  DocumentStatus,
  DocumentSummary,
  ProjectSummary,
} from '@/types/document'

const INITIAL_FILTER: DocumentFilterState = { statuses: [], docTypes: [], tags: [], query: '' }
const ACTIVE_DOCUMENT_STATUSES: DocumentStatus[] = ['QUEUED', 'PARSING', 'INDEXING']

function getDocType(document: DocumentSummary) {
  const ext = document.originalFilename.split('.').pop()?.toUpperCase()
  if (ext === 'MD') return 'MARKDOWN'
  return ext || document.mimeType.split('/').pop()?.toUpperCase() || 'UNKNOWN'
}

function RetryBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-900">
      <span>{message}</span>
      <button type="button" className="font-semibold underline" onClick={onRetry}>Retry</button>
    </div>
  )
}

export default function ProjectDocumentsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const listRef = useRef<HTMLDivElement>(null)
  const deepLinkedDocumentId = searchParams.get('documentId') ?? undefined
  const highlightChunkId = searchParams.get('chunkId') ?? undefined
  const [project, setProject] = useState<ProjectSummary>()
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentDetail>()
  const [chunks, setChunks] = useState<DocumentChunk[]>([])
  const [filter, setFilter] = useState<DocumentFilterState>(INITIAL_FILTER)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>(deepLinkedDocumentId)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [projectError, setProjectError] = useState<string>()
  const [listError, setListError] = useState<string>()
  const [detailError, setDetailError] = useState<string>()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [listReloadKey, setListReloadKey] = useState(0)
  const [detailReloadKey, setDetailReloadKey] = useState(0)
  const [pollingState, setPollingState] = useState<'healthy' | 'stale'>('healthy')
  const [consecutiveFailures, setConsecutiveFailures] = useState(0)
  const canUpload = user?.role === 'admin' || user?.role === 'editor'
  const canScopeToProject = user?.role !== 'viewer'
  const activeDocumentCount = documents.filter((document) => ACTIVE_DOCUMENT_STATUSES.includes(document.status)).length
  const hasActiveDocuments = activeDocumentCount > 0
  const isPollingStale = pollingState === 'stale' && consecutiveFailures >= 3

  useEffect(() => {
    setSelectedDocumentId(deepLinkedDocumentId)
  }, [deepLinkedDocumentId])

  useEffect(() => {
    let ignore = false
    setIsLoadingList(true)
    setProject(undefined)
    setDocuments([])
    setProjectError(undefined)
    setListError(undefined)

    void Promise.all([
      projectService.getProjectDetail(projectId),
      documentService.getProjectDocuments(projectId, {}, {}),
    ]).then(([projectRes, documentsRes]) => {
      if (ignore) return
      if (projectRes.data) {
        setProject({
          id: projectRes.data.id,
          name: projectRes.data.name,
          description: projectRes.data.description,
          status: projectRes.data.status,
        })
      } else {
        setProjectError(projectRes.error || '\uD504\uB85C\uC81D\uD2B8 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.')
      }
      setDocuments(documentsRes.data ?? [])
      if (documentsRes.error) setListError(documentsRes.error)
    }).finally(() => {
      if (!ignore) setIsLoadingList(false)
    })

    return () => {
      ignore = true
    }
  }, [projectId, listReloadKey])

  useEffect(() => {
    if (!selectedDocumentId) {
      setSelectedDocument(undefined)
      setChunks([])
      setDetailError(undefined)
      return
    }

    let ignore = false
    setIsLoadingDetail(true)
    setSelectedDocument(undefined)
    setChunks([])
    setDetailError(undefined)

    void Promise.all([
      documentService.getDocument(selectedDocumentId),
      documentService.getDocumentChunks(selectedDocumentId, { limit: 10 }),
    ]).then(([documentRes, chunksRes]) => {
      if (ignore) return
      setSelectedDocument(documentRes.data)
      setChunks(chunksRes.data ?? [])
      if (documentRes.error || !documentRes.data || chunksRes.error) {
        setDetailError(documentRes.error || chunksRes.error || '\uBB38\uC11C \uC0C1\uC138 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.')
      }
    }).finally(() => {
      if (!ignore) setIsLoadingDetail(false)
    })

    return () => {
      ignore = true
    }
  }, [selectedDocumentId, detailReloadKey])

  useEffect(() => {
    if (!deepLinkedDocumentId || selectedDocumentId !== deepLinkedDocumentId) return
    const frame = window.requestAnimationFrame(() => {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-document-id="${selectedDocumentId}"]`)
        ?.scrollIntoView({ block: 'center' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [deepLinkedDocumentId, selectedDocumentId])

  const pollInProgressDocuments = useCallback(async () => {
    const res = await documentService.getProjectDocuments(projectId, {
      statuses: ACTIVE_DOCUMENT_STATUSES,
    })

    if (res.error) {
      setConsecutiveFailures((current) => {
        const next = current + 1
        setPollingState(next >= 3 ? 'stale' : 'healthy')
        return next
      })
      return false
    }

    setDocuments((current) => {
      const updates = new Map((res.data ?? []).map((document) => [document.id, document]))
      return current.map((document) => updates.get(document.id) ?? document)
    })
    if ((res.data ?? []).length < activeDocumentCount) {
      setListReloadKey((current) => current + 1)
    }
    setConsecutiveFailures(0)
    setPollingState('healthy')
    return true
  }, [activeDocumentCount, projectId])

  useEffect(() => {
    if (isLoadingList || !hasActiveDocuments) {
      setConsecutiveFailures(0)
      setPollingState('healthy')
      return
    }

    const intervalId = window.setInterval(() => {
      void pollInProgressDocuments()
    }, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [hasActiveDocuments, isLoadingList, pollInProgressDocuments])

  const availableTags = useMemo(() => Array.from(new Set(documents.flatMap((item) => item.tags))).sort(), [documents])
  const filteredDocs = useMemo(() => {
    const query = filter.query?.trim().toLowerCase()
    const from = filter.uploadedFrom ? new Date(filter.uploadedFrom).getTime() : undefined
    const to = filter.uploadedTo ? new Date(`${filter.uploadedTo}T23:59:59.999`).getTime() : undefined
    return documents.filter((document) => {
      const uploadedAt = new Date(document.uploadedAt).getTime()
      return (!filter.statuses.length || filter.statuses.includes(document.status))
        && (!filter.docTypes.length || filter.docTypes.includes(getDocType(document)))
        && (!filter.tags.length || filter.tags.some((tag) => document.tags.includes(tag)))
        && (!query || [document.title, document.originalFilename, document.summary].join(' ').toLowerCase().includes(query))
        && (!from || uploadedAt >= from)
        && (!to || uploadedAt <= to)
    })
  }, [documents, filter])
  const failedCount = filteredDocs.filter((document) => document.status === 'FAILED').length
  const headerProject = project ?? { id: projectId, name: 'Project documents', status: 'active' as const }
  const showHeaderSkeleton = isLoadingList && !project && !projectError

  async function onDelete(id: string) {
    if (!window.confirm('\uC774 \uBB38\uC11C\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?')) return
    const res = await documentService.deleteDocument(id)
    if (res.error) {
      window.alert(res.error)
      return
    }
    setDocuments((prev) => prev.filter((item) => item.id !== id))
    if (selectedDocumentId === id) setSelectedDocumentId(undefined)
  }

  function onUploaded() {
    setIsUploadOpen(false)
    setListReloadKey((prev) => prev + 1)
  }

  if (!isLoadingList && projectError && listError) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-8 text-center shadow-panel">
          <h1 className="text-xl font-semibold text-text-primary">\uD398\uC774\uC9C0\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4</h1>
          <p className="mt-3 text-sm text-text-secondary">{projectError} {listError}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      {showHeaderSkeleton ? (
        <Skeleton height={88} rounded="lg" />
      ) : (
        <ProjectDocumentsHeader project={headerProject} totalCount={documents.length} canUpload={canUpload} onOpenUpload={() => setIsUploadOpen(true)} />
      )}
      {projectError && !listError ? <div className="mb-4"><RetryBanner message={projectError} onRetry={() => setListReloadKey((prev) => prev + 1)} /></div> : null}
      {isPollingStale ? <div className="mb-4"><PollingDisconnectedBanner visible onRetry={() => { void pollInProgressDocuments() }} /></div> : null}
      {failedCount > 0 ? <FailedDocumentNotice failedCount={failedCount} onFilterFailed={() => setFilter((prev) => ({ ...prev, statuses: ['FAILED'] }))} /> : null}
      {showHeaderSkeleton ? null : <DocumentFilters value={filter} availableTags={availableTags} onChange={setFilter} />}
      {listError && !projectError ? <div className="mt-4"><RetryBanner message={listError} onRetry={() => setListReloadKey((prev) => prev + 1)} /></div> : null}

      {filteredDocs.length === 0 && !isLoadingList && documents.length === 0 && !listError ? (
        <div className="flex min-h-[460px] items-center justify-center">
          <div className="w-full max-w-4xl"><EmptyDocumentsState canUpload={canUpload} onOpenUpload={() => setIsUploadOpen(true)} onFilesDropped={() => setIsUploadOpen(true)} /></div>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
          <div ref={listRef}>
            <DocumentList
              documents={filteredDocs}
              selectedId={selectedDocumentId}
              isLoading={isLoadingList}
              hasMore={false}
              error={listError ? new Error(listError) : undefined}
              onSelect={setSelectedDocumentId}
              onLoadMore={() => {}}
              onRerun={() => window.alert('\uC7AC\uC2E4\uD589 API \uBBF8\uAD6C\uD604')}
              onDelete={onDelete}
              readOnly={!canUpload}
            />
          </div>
          <div className="space-y-3">
            {detailError ? <RetryBanner message={detailError} onRetry={() => setDetailReloadKey((prev) => prev + 1)} /> : null}
            <DocumentSummaryPanel
              document={selectedDocument}
              chunksPreview={chunks}
              highlightChunkId={highlightChunkId}
              isLoading={isLoadingDetail}
              error={detailError ? new Error(detailError) : undefined}
              onOpenChat={(docId) => router.push(canScopeToProject ? `/chat?scope=project&projectId=${projectId}&documentId=${docId}` : '/chat')}
            />
          </div>
        </div>
      )}

      {canUpload ? <UploadDrawer isOpen={isUploadOpen} projectId={projectId} onClose={() => setIsUploadOpen(false)} onUploaded={onUploaded} /> : null}
    </div>
  )
}
