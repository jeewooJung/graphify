'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Skeleton } from '@/components/feedback'
import {
  ProjectCtaRow,
  ProjectDetailHeader,
  ProjectMetricCards,
  RecentProjectChatSessions,
  RecentProjectUploads,
} from '@/components/project'
import { EmptyDocumentsState } from '@/components/documents'
import { UploadDrawer } from '@/components/upload/UploadDrawer'
import { projectService } from '@/lib/api/project-service'
import { useUser } from '@/lib/auth/user-context'
import { ROUTES } from '@/lib/routes'
import type { ChatSessionSummary } from '@/types/chat'
import type { DocumentSummary, ProjectDetail, ProjectMetrics } from '@/types/document'

type ProjectPageSummary = {
  detail: ProjectDetail
  metrics: ProjectMetrics
  recentDocuments: DocumentSummary[]
  recentSessions: ChatSessionSummary[]
}

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()
  const { user } = useUser()
  const [summary, setSummary] = useState<ProjectPageSummary>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const canUpload = user?.role === 'admin' || user?.role === 'editor'
  const canScopeToProject = user?.role !== 'viewer'

  useEffect(() => {
    let ignore = false

    async function loadSummary() {
      setIsLoading(true)
      setError(undefined)
      const res = await projectService.getProjectSummary(projectId)
      if (ignore) return
      if (res.data) setSummary(res.data)
      if (res.error) setError(res.error)
      if (!res.data) setSummary(undefined)
      setIsLoading(false)
    }

    void loadSummary()

    return () => {
      ignore = true
    }
  }, [projectId, reloadKey])

  const onAsk = () => router.push(canScopeToProject ? `/chat?scope=project&projectId=${projectId}` : '/chat')
  const onOpenDocuments = () => router.push(ROUTES.projectDocuments(projectId))
  const onOpenUpload = () => setIsUploadOpen(true)
  const onSelectDocument = (doc: DocumentSummary) => router.push(`${ROUTES.projectDocuments(projectId)}?documentId=${doc.id}`)
  const onSelectSession = (id: string) => router.push(ROUTES.chatSession(id))
  const onStartNew = () => onAsk()
  const onUploaded = () => {
    setIsUploadOpen(false)
    setReloadKey((prev) => prev + 1)
  }

  if (isLoading && !summary) {
    return (
      <div className="page-shell space-y-6">
        <Skeleton width="50%" height={64} rounded="lg" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} height={112} rounded="lg" />)}
        </div>
        <Skeleton width={320} height={40} rounded="full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton height={192} rounded="lg" />
          <Skeleton height={192} rounded="lg" />
        </div>
      </div>
    )
  }

  if (error && !summary) {
    return (
      <div className="page-shell flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-8 text-center shadow-panel">
          <h1 className="text-xl font-semibold text-text-primary">\uD504\uB85C\uC81D\uD2B8\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4</h1>
          <p className="mt-3 text-sm text-text-secondary">{error}</p>
          <button type="button" onClick={() => setReloadKey((prev) => prev + 1)} className="mt-6 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">Retry</button>
        </div>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="page-shell space-y-6">
      <ProjectDetailHeader project={summary.detail} canEdit onEdit={() => console.log('Edit project', projectId)} />
      <ProjectMetricCards metrics={summary.metrics} isLoading={false} />
      <ProjectCtaRow projectId={projectId} canUpload={canUpload} onAsk={onAsk} onOpenDocuments={onOpenDocuments} onOpenUpload={onOpenUpload} />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentProjectUploads documents={summary.recentDocuments} isLoading={false} onSelect={onSelectDocument} onOpenAll={onOpenDocuments} />
        <RecentProjectChatSessions sessions={summary.recentSessions} isLoading={false} onSelect={onSelectSession} onStartNew={onStartNew} />
      </div>

      {summary.recentDocuments.length === 0 ? <EmptyDocumentsState canUpload={canUpload} onOpenUpload={onOpenUpload} onFilesDropped={() => setIsUploadOpen(true)} /> : null}
      <UploadDrawer isOpen={isUploadOpen} projectId={projectId} onClose={() => setIsUploadOpen(false)} onUploaded={onUploaded} />
    </div>
  )
}
