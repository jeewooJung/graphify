'use client'

import React from 'react'
import { Badge } from '@/components/ui'
import { Trash2, Edit, ExternalLink } from 'lucide-react'

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
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-text-tertiary)' }}>Loading projects...</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-text-tertiary)' }}>No projects yet</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {projects.map(project => (
        <div
          key={project.id}
          className="p-4 rounded-lg border hover:bg-surface-hover transition-colors"
          style={{ borderColor: 'var(--color-border)', backgroundColor: '#ffffff' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold text-base mb-1">
                {project.name}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mb-2">
                {project.description}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <span style={{ color: 'var(--color-text-tertiary)' }} className="text-xs">
                  Owner: {project.owner}
                </span>
                <span style={{ color: 'var(--color-text-tertiary)' }} className="text-xs">
                  {project.memberCount} members
                </span>
                <span style={{ color: 'var(--color-text-tertiary)' }} className="text-xs">
                  {project.graphCount} graphs
                </span>
                <Badge variant="primary" style={{ backgroundColor: project.status === 'active' ? '#10b981' : '#9ca3af' }}>
                  {project.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onViewProject?.(project.id)}
                className="p-2 hover:bg-surface rounded transition-colors"
              >
                <ExternalLink size={16} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
              <button
                onClick={() => onEditProject?.(project.id)}
                className="p-2 hover:bg-surface rounded transition-colors"
              >
                <Edit size={16} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
              <button
                onClick={() => onDeleteProject?.(project.id)}
                className="p-2 hover:bg-surface rounded transition-colors"
              >
                <Trash2 size={16} style={{ color: 'var(--color-error)' }} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
