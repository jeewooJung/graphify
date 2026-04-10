'use client'

import React, { useEffect, useState } from 'react'
import { Button, PageHeader } from '@/components/ui'
import { ProjectList } from '@/components/project/ProjectList'
import { projectService } from '@/lib/api/project-service'
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

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Customer Analytics',
    description: 'Customer data and relationship graph',
    owner: 'Alice Johnson',
    memberCount: 5,
    graphCount: 12,
    createdDate: '2024-01-10',
    lastModified: '2024-04-08',
    status: 'active',
  },
  {
    id: '2',
    name: 'Product Catalog',
    description: 'Product hierarchy and relationships',
    owner: 'Bob Smith',
    memberCount: 3,
    graphCount: 8,
    createdDate: '2024-02-15',
    lastModified: '2024-04-05',
    status: 'active',
  },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      const response = await projectService.getProjects()

      if (response.error) {
        setProjects(MOCK_PROJECTS)
      } else {
        setProjects(response.data || MOCK_PROJECTS)
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

      <div>
        <ProjectList
          projects={projects}
          loading={loading}
          onViewProject={(id) => console.log('View project', id)}
          onEditProject={(id) => console.log('Edit project', id)}
          onDeleteProject={(id) => console.log('Delete project', id)}
        />
      </div>
    </div>
  )
}
