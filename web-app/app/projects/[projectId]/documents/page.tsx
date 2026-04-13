'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  DocumentFilters,
  DocumentList,
  DocumentSummaryPanel,
  EmptyDocumentsState,
  FailedDocumentNotice,
  ProjectDocumentsHeader,
} from '@/components/documents'
import type {
  DocumentChunk,
  DocumentDetail,
  DocumentFilterState,
  DocumentSummary,
  ProjectSummary,
} from '@/types/document'

const INITIAL_FILTER: DocumentFilterState = { statuses: [], docTypes: [], tags: [], query: '' }
const MOCK_PROJECT: ProjectSummary = { id: 'project-aurora', name: 'Aurora Knowledge Base', status: 'active' }
const MOCK_DOCS: DocumentSummary[] = [
  { id: 'doc-01', title: 'Onboarding handbook', originalFilename: 'onboarding-handbook.pdf', mimeType: 'application/pdf', fileSize: 824123, status: 'READY', uploadedBy: 'Mina Lee', uploadedAt: '2026-04-11T09:15:00.000Z', tags: ['hr', 'process'], summary: 'Shared onboarding guidance and team norms.' },
  { id: 'doc-02', title: 'Research plan Q2', originalFilename: 'research-plan-q2.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileSize: 512420, status: 'PARSING', progressPct: 64, jobStatus: 'RUNNING', uploadedBy: 'Ethan Park', uploadedAt: '2026-04-12T14:20:00.000Z', tags: ['research', 'priority'], summary: 'Parsing 64% complete for the quarterly research plan.' },
  { id: 'doc-03', title: 'API rollout notes', originalFilename: 'api-rollout-notes.md', mimeType: 'text/markdown', fileSize: 18200, status: 'FAILED', jobStatus: 'FAILED', uploadedBy: 'Sara Kim', uploadedAt: '2026-04-12T18:05:00.000Z', tags: ['engineering', 'incident'], summary: 'Chunking failed after OCR validation.' },
  { id: 'doc-04', title: 'Customer interview digest', originalFilename: 'customer-interviews.txt', mimeType: 'text/plain', fileSize: 28111, status: 'READY', uploadedBy: 'Liam Choi', uploadedAt: '2026-04-10T11:00:00.000Z', tags: ['research', 'customer'], summary: 'Key interview quotes and objections from April calls.' },
  { id: 'doc-05', title: 'Risk register', originalFilename: 'risk-register.pdf', mimeType: 'application/pdf', fileSize: 654910, status: 'INDEXING', jobStatus: 'RUNNING', uploadedBy: 'Mina Lee', uploadedAt: '2026-04-09T08:40:00.000Z', tags: ['ops', 'compliance'], summary: 'Current risk themes, mitigations, and owners.' },
  { id: 'doc-06', title: 'Data retention policy', originalFilename: 'data-retention-policy.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileSize: 433001, status: 'QUEUED', jobStatus: 'PENDING', uploadedBy: 'Alex Han', uploadedAt: '2026-04-08T16:30:00.000Z', tags: ['legal', 'policy'], summary: 'Awaiting worker pickup for retention policy update.' },
  { id: 'doc-07', title: 'Sales enablement pack', originalFilename: 'sales-enablement-pack.pdf', mimeType: 'application/pdf', fileSize: 932004, status: 'UPLOADED', uploadedBy: 'Nora Jang', uploadedAt: '2026-04-07T13:10:00.000Z', tags: ['sales', 'messaging'], summary: 'New positioning slides for outbound conversations.' },
  { id: 'doc-08', title: 'Launch checklist', originalFilename: 'launch-checklist.md', mimeType: 'text/markdown', fileSize: 24102, status: 'READY', uploadedBy: 'Ethan Park', uploadedAt: '2026-04-06T07:55:00.000Z', tags: ['launch', 'priority'], summary: 'Cross-functional launch checklist with owners and dates.' },
]

function getDocType(document: DocumentSummary) {
  const ext = document.originalFilename.split('.').pop()?.toUpperCase()
  if (ext === 'MD') return 'MARKDOWN'
  return ext || document.mimeType.split('/').pop()?.toUpperCase() || 'UNKNOWN'
}

function buildDetail(document?: DocumentSummary): DocumentDetail | undefined {
  if (!document) return undefined
  return {
    ...document,
    updatedAt: '2026-04-13T10:00:00.000Z',
    sourceType: 'UPLOAD',
    chunkCount: 3,
    storagePath: `projects/${MOCK_PROJECT.id}/documents/${document.id}`,
    lastAnalysisLog: document.status === 'FAILED'
      ? 'OCR completed. Chunk synthesis failed at section boundary detection.'
      : document.status === 'PARSING'
        ? 'Parser worker is extracting structured sections and tables.'
        : 'Latest analysis completed successfully and preview is available.',
  }
}

function buildChunks(documentId?: string): DocumentChunk[] {
  if (!documentId) return []
  return [
    { id: `${documentId}-chunk-1`, documentId, chunkIndex: 0, pageNumber: 1, tokenCount: 224, sectionTitle: 'Overview', content: 'This section summarizes the document intent, key owners, and the actions the team should take next.' },
    { id: `${documentId}-chunk-2`, documentId, chunkIndex: 1, pageNumber: 2, tokenCount: 318, sectionTitle: 'Key findings', content: 'Important findings are grouped into short bullet-style paragraphs to support quick scanning and follow-up discussions.' },
    { id: `${documentId}-chunk-3`, documentId, chunkIndex: 2, pageNumber: 3, tokenCount: 287, sectionTitle: 'Open questions', content: 'Open questions capture unresolved risks, pending approvals, and assumptions that should be validated in chat.' },
  ]
}

export default function ProjectDocumentsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const listRef = useRef<HTMLDivElement>(null)
  const deepLinkedDocumentId = searchParams.get('documentId') || undefined
  const highlightChunkId = searchParams.get('chunkId') || undefined
  const [filter, setFilter] = useState<DocumentFilterState>(INITIAL_FILTER)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>(deepLinkedDocumentId)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const isLoading = false

  useEffect(() => {
    if (deepLinkedDocumentId) setSelectedDocumentId(deepLinkedDocumentId)
  }, [deepLinkedDocumentId])

  useEffect(() => {
    if (!isUploadOpen) return
    console.log('UploadDrawer placeholder open for project documents')
  }, [isUploadOpen])

  useEffect(() => {
    if (!deepLinkedDocumentId || selectedDocumentId !== deepLinkedDocumentId) return
    const frame = window.requestAnimationFrame(() => {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-document-id="${selectedDocumentId}"]`)
        ?.scrollIntoView({ block: 'center' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [deepLinkedDocumentId, selectedDocumentId])

  const availableTags = useMemo(
    () => Array.from(new Set(MOCK_DOCS.flatMap((document) => document.tags))).sort(),
    []
  )

  const filteredDocs = useMemo(() => {
    const query = filter.query?.trim().toLowerCase()
    const from = filter.uploadedFrom ? new Date(filter.uploadedFrom).getTime() : undefined
    const to = filter.uploadedTo ? new Date(`${filter.uploadedTo}T23:59:59.999`).getTime() : undefined
    return MOCK_DOCS.filter((document) => {
      const uploadedAt = new Date(document.uploadedAt).getTime()
      return (!filter.statuses.length || filter.statuses.includes(document.status))
        && (!filter.docTypes.length || filter.docTypes.includes(getDocType(document)))
        && (!filter.tags.length || filter.tags.some((tag) => document.tags.includes(tag)))
        && (!query || document.title.toLowerCase().includes(query) || document.originalFilename.toLowerCase().includes(query))
        && (!from || uploadedAt >= from)
        && (!to || uploadedAt <= to)
    })
  }, [filter])

  const failedCount = filteredDocs.filter((document) => document.status === 'FAILED').length
  const selectedDocument = useMemo(
    () => buildDetail(MOCK_DOCS.find((document) => document.id === selectedDocumentId)),
    [selectedDocumentId]
  )
  const mockChunks = useMemo(() => buildChunks(selectedDocument?.id), [selectedDocument?.id])

  return (
    <div className="page-shell">
      <ProjectDocumentsHeader
        project={{ ...MOCK_PROJECT, id: projectId }}
        totalCount={MOCK_DOCS.length}
        canUpload
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {failedCount > 0 ? (
        <FailedDocumentNotice
          failedCount={failedCount}
          onFilterFailed={() => setFilter((prev) => ({ ...prev, statuses: ['FAILED'] }))}
        />
      ) : null}

      <DocumentFilters value={filter} availableTags={availableTags} onChange={setFilter} />

      {filteredDocs.length === 0 && !isLoading && MOCK_DOCS.length === 0 ? (
        <div className="flex min-h-[460px] items-center justify-center">
          <div className="w-full max-w-4xl">
            <EmptyDocumentsState
              canUpload
              onOpenUpload={() => setIsUploadOpen(true)}
              onFilesDropped={(files) => console.log(files)}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
          <div ref={listRef}>
            <DocumentList
              documents={filteredDocs}
              selectedId={selectedDocumentId}
              isLoading={isLoading}
              hasMore={false}
              onSelect={setSelectedDocumentId}
              onLoadMore={() => {}}
              onRerun={(id) => console.log('rerun document', id)}
              onDelete={(id) => console.log('delete document', id)}
            />
          </div>

          <DocumentSummaryPanel
            document={selectedDocument}
            chunksPreview={mockChunks}
            highlightChunkId={highlightChunkId}
            isLoading={isLoading}
            onOpenChat={(id) => router.push(`/chat?scope=project&projectId=${projectId}&documentId=${id}`)}
          />
        </div>
      )}
    </div>
  )
}
