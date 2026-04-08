'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
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
    <div style={{ backgroundColor: '#ffffff' }} className="min-h-screen">
      {/* Header */}
      <div style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }} className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-semibold mb-2">
              Projects
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Manage your knowledge graph projects
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={18} />
            New Project
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-6xl">
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
