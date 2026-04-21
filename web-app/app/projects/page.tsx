'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ConfirmDialog, PageHeader } from '@/components/ui'
import { ProjectList } from '@/components/project/ProjectList'
import { ProjectModal } from '@/components/project/ProjectModal'
import { projectService, type Project } from '@/lib/api/project-service'
import { ROUTES } from '@/lib/routes'
import { Plus } from 'lucide-react'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [projectModal, setProjectModal] = useState<
    { mode: 'create' } | { mode: 'edit'; project: Project } | null
  >(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  const loadProjects = useCallback(async () => {
    const response = await projectService.getProjects()

    if (response.error) {
      setProjects([])
      setError(response.error)
    } else {
      setProjects(response.data || [])
      setError('')
    }

    setLoading(false)
  }, [])

  const reloadProjects = useCallback(async () => {
    setLoading(true)
    await loadProjects()
  }, [loadProjects])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProjects()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadProjects])

  const openEditModal = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId)
    if (!project) return

    setProjectModal({ mode: 'edit', project })
  }

  const openDeleteDialog = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId)
    if (!project) return

    setProjectToDelete(project)
  }

  const handleProjectSubmit = async (values: { name: string; description: string }) => {
    const response = projectModal?.mode === 'edit'
      ? await projectService.updateProject(projectModal.project.id, values)
      : await projectService.createProject(values)

    if (response.error) {
      setError(response.error)
      return
    }

    setError('')
    await reloadProjects()
    setProjectModal(null)
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    const response = await projectService.deleteProject(projectToDelete.id)
    if (response.error) {
      setError(response.error)
      return
    }

    setError('')
    await reloadProjects()
    setProjectToDelete(null)
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Delivery programs"
        title="Projects"
        description="Track graph initiatives as focused delivery streams. Each project groups the people, graphs, and review cycles behind a clear outcome."
        meta={
          <>
            <span className="app-chip">{projects.length} tracked projects</span>
            <span className="app-chip">Cross-team visibility</span>
          </>
        }
        actions={(
          <Button variant="primary" onClick={() => setProjectModal({ mode: 'create' })}>
            <Plus size={16} />
            New project
          </Button>
        )}
      />

      <div className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-500">
            {error}
          </div>
        )}

        <ProjectList
          projects={projects}
          loading={loading}
          onViewProject={(id) => router.push(ROUTES.project(id))}
          onEditProject={openEditModal}
          onDeleteProject={openDeleteDialog}
          onCreateProject={() => setProjectModal({ mode: 'create' })}
        />
      </div>

      <ProjectModal
        open={projectModal !== null}
        project={projectModal?.mode === 'edit' ? projectModal.project : undefined}
        onCancel={() => setProjectModal(null)}
        onSubmit={handleProjectSubmit}
      />

      <ConfirmDialog
        open={projectToDelete !== null}
        title="Archive project"
        message={projectToDelete
          ? `Archive ${projectToDelete.name}? Archived projects are hidden from the active list.`
          : ''}
        confirmLabel="Archive project"
        destructive
        onConfirm={handleDeleteProject}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  )
}
