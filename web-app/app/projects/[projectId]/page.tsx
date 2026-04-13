'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ProjectCtaRow,
  ProjectDetailHeader,
  ProjectMetricCards,
  RecentProjectChatSessions,
  RecentProjectUploads,
} from '@/components/project'
import { EmptyDocumentsState } from '@/components/documents'
import { UploadDrawer } from '@/components/upload/UploadDrawer'
import { ROUTES } from '@/lib/routes'
import type { ChatSessionSummary } from '@/types/chat'
import type {
  DocumentSummary,
  ProjectDetail,
  ProjectMetrics,
  UploadResult,
} from '@/types/document'

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString()
}

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const mockProjectDetail: ProjectDetail = {
    id: projectId,
    name: 'Acme Wiki',
    description: 'Internal product docs',
    ownerName: 'Jane Doe',
    teamName: 'Product',
    status: 'active',
    createdAt: '2026-04-01T09:00:00.000Z',
    updatedAt: '2026-04-13T10:15:00.000Z',
  }

  const mockMetrics: ProjectMetrics = {
    documentCount: 24,
    lastUploadAt: minutesAgo(42),
    runningJobCount: 2,
    memberCount: 8,
  }

  const mockRecentDocs: DocumentSummary[] = useMemo(() => ([
    { id: 'doc-001', title: 'Product overview', originalFilename: 'product-overview.pdf', mimeType: 'application/pdf', fileSize: 824123, status: 'READY', uploadedBy: 'Jane Doe', uploadedAt: minutesAgo(42), tags: ['product', 'overview'], summary: 'Core product narrative and positioning.' },
    { id: 'doc-002', title: 'Roadmap Q2', originalFilename: 'roadmap-q2.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileSize: 512004, status: 'INDEXING', progressPct: 74, jobStatus: 'RUNNING', uploadedBy: 'Alex Kim', uploadedAt: minutesAgo(95), tags: ['roadmap'], summary: 'Quarterly priorities and sequencing.' },
    { id: 'doc-003', title: 'Support runbook', originalFilename: 'support-runbook.md', mimeType: 'text/markdown', fileSize: 24122, status: 'FAILED', jobStatus: 'FAILED', uploadedBy: 'Mina Park', uploadedAt: minutesAgo(180), tags: ['support', 'ops'], summary: 'Incident handling guide for frontline issues.' },
    { id: 'doc-004', title: 'Launch checklist', originalFilename: 'launch-checklist.txt', mimeType: 'text/plain', fileSize: 18822, status: 'PARSING', progressPct: 31, jobStatus: 'RUNNING', uploadedBy: 'Chris Lee', uploadedAt: minutesAgo(360), tags: ['launch'], summary: 'Cross-functional launch gates and owners.' },
    { id: 'doc-005', title: 'Pricing FAQ', originalFilename: 'pricing-faq.pdf', mimeType: 'application/pdf', fileSize: 392110, status: 'QUEUED', jobStatus: 'PENDING', uploadedBy: 'Dana Choi', uploadedAt: minutesAgo(960), tags: ['pricing', 'sales'], summary: 'Answers for common pricing objections.' },
  ]), [])

  const mockRecentSessions: ChatSessionSummary[] = useMemo(() => ([
    { id: 'chat-001', title: 'What changed in the pricing FAQ?', scope: { kind: 'PROJECT', projectId }, lastMessageAt: minutesAgo(18), createdBy: 'Jane Doe' },
    { id: 'chat-002', title: 'Summarize launch blockers from recent docs', scope: { kind: 'PROJECT', projectId }, lastMessageAt: minutesAgo(140), createdBy: 'Alex Kim' },
    { id: 'chat-003', title: 'Find onboarding references for support', scope: { kind: 'PROJECT', projectId }, lastMessageAt: minutesAgo(420), createdBy: 'Mina Park' },
  ]), [projectId])

  const canUpload = true

  const onAsk = () => router.push(`/chat?scope=project&projectId=${projectId}`)
  const onOpenDocuments = () => router.push(ROUTES.projectDocuments(projectId))
  const onOpenUpload = () => setIsUploadOpen(true)
  const onSelectDocument = (doc: DocumentSummary) => {
    router.push(`${ROUTES.projectDocuments(projectId)}?documentId=${doc.id}`)
  }
  const onSelectSession = (id: string) => router.push(ROUTES.chatSession(id))
  const onStartNew = () => onAsk()
  const onUploadClose = () => setIsUploadOpen(false)
  const onUploaded = (_result: UploadResult) => setIsUploadOpen(false)

  return (
    <div className="page-shell space-y-6">
      <ProjectDetailHeader
        project={mockProjectDetail}
        canEdit
        onEdit={() => console.log('Edit project', projectId)}
      />

      <ProjectMetricCards metrics={mockMetrics} isLoading={false} />

      <ProjectCtaRow
        projectId={projectId}
        canUpload={canUpload}
        onAsk={onAsk}
        onOpenDocuments={onOpenDocuments}
        onOpenUpload={onOpenUpload}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentProjectUploads
          documents={mockRecentDocs}
          isLoading={false}
          onSelect={onSelectDocument}
          onOpenAll={onOpenDocuments}
        />
        <RecentProjectChatSessions
          sessions={mockRecentSessions}
          isLoading={false}
          onSelect={onSelectSession}
          onStartNew={onStartNew}
        />
      </div>

      {mockRecentDocs.length === 0 ? (
        <EmptyDocumentsState
          canUpload
          onOpenUpload={onOpenUpload}
          onFilesDropped={(files) => console.log('Dropped files', files)}
        />
      ) : null}

      <UploadDrawer
        isOpen={isUploadOpen}
        projectId={projectId}
        onClose={onUploadClose}
        onUploaded={onUploaded}
      />
    </div>
  )
}
