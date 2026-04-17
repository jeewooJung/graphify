'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, PageHeader } from '@/components/ui'
import { ProjectList } from '@/components/project/ProjectList'
import { projectService } from '@/lib/api/project-service'
import { ROUTES } from '@/lib/routes'
import { Plus } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  owner: string
  memberCount: number
  graphCount: number
  createdDate: string
  lastModified: string
  status: 'active' | 'archived'
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      const response = await projectService.getProjects()

      if (response.error) {
        setProjects([])
        setError(response.error)
      } else {
        setProjects(response.data || [])
        setError('')
      }
      setLoading(false)
    }

    fetchProjects()
  }, [])

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
          <Button variant="primary">
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
          onEditProject={(id) => console.log('Edit project', id)}
          onDeleteProject={(id) => console.log('Delete project', id)}
        />
      </div>
    </div>
  )
}
