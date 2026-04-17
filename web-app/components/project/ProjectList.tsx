'use client'

import React from 'react'
import { Badge } from '@/components/ui'
import { Edit, ExternalLink, Trash2 } from 'lucide-react'

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

interface ProjectListProps {
  projects: Project[]
  loading?: boolean
  onEditProject?: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
  onViewProject?: (projectId: string) => void
}

export function ProjectList({
  projects = [],
  loading = false,
  onEditProject,
  onDeleteProject,
  onViewProject,
}: ProjectListProps) {
  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading projects...</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <p>No projects yet</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {projects.map(project => (
        <div
          key={project.id}
          className="app-card p-5 transition-all hover:-translate-y-0.5"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                  {project.status}
                </Badge>
                <span className="text-xs font-medium text-text-tertiary">
                  Updated {project.lastModified}
                </span>
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-text-primary">
                {project.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {project.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="app-chip">
                  Owner: {project.owner}
                </span>
                <span className="app-chip">
                  {project.memberCount} members
                </span>
                <span className="app-chip">
                  {project.graphCount} graphs
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="View project"
                onClick={() => onViewProject?.(project.id)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/82 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <ExternalLink size={16} />
              </button>
              <button
                type="button"
                aria-label="Edit project"
                onClick={() => onEditProject?.(project.id)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/82 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <Edit size={16} />
              </button>
              <button
                type="button"
                aria-label="Delete project"
                onClick={() => onDeleteProject?.(project.id)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/82 text-error-500 transition-colors hover:bg-error-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
