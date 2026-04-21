'use client'

import React from 'react'
import type { Project } from '@/lib/api/project-service'
import {
  Clock,
  Edit,
  FolderPlus,
  Network,
  Plus,
  Trash2,
  User,
  Users,
} from 'lucide-react'

interface ProjectListProps {
  projects: Project[]
  loading?: boolean
  onEditProject?: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
  onViewProject?: (projectId: string) => void
  onCreateProject?: () => void
}

export function ProjectList({
  projects = [],
  loading = false,
  onEditProject,
  onDeleteProject,
  onViewProject,
  onCreateProject,
}: ProjectListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="app-card p-5">
            <div className="flex items-center justify-between">
              <div className="h-4 w-16 animate-pulse rounded-full bg-[rgba(17,24,39,0.06)]" />
              <div className="h-4 w-20 animate-pulse rounded bg-[rgba(17,24,39,0.06)]" />
            </div>
            <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-[rgba(17,24,39,0.08)]" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-[rgba(17,24,39,0.06)]" />
            <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-[rgba(17,24,39,0.06)]" />
            <div className="mt-5 h-3 w-2/3 animate-pulse rounded bg-[rgba(17,24,39,0.05)]" />
          </div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="app-card flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-700">
          <FolderPlus size={22} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-text-primary">No projects yet</h3>
          <p className="max-w-sm text-sm text-text-secondary">
            Create your first project to organize graphs, members, and review cycles in one place.
          </p>
        </div>
        {onCreateProject && (
          <button
            type="button"
            onClick={onCreateProject}
            className="btn-primary mt-2 h-9 px-3.5 text-[13px]"
          >
            <Plus size={14} />
            New project
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map(project => (
        <div
          key={project.id}
          role="button"
          tabIndex={0}
          onClick={() => onViewProject?.(project.id)}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onViewProject?.(project.id)
            }
          }}
          className="group relative app-card cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:border-[rgba(79,110,247,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${project.status === 'active' ? 'bg-success-500' : 'bg-text-quaternary'}`}
              />
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {project.status}
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
              <button
                type="button"
                aria-label={`Edit ${project.name}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onEditProject?.(project.id)
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <Edit size={14} />
              </button>
              <button
                type="button"
                aria-label={`Delete ${project.name}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onDeleteProject?.(project.id)
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-error-50 hover:text-error-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-text-primary line-clamp-1">
                {project.name}
            </h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary line-clamp-2">
              {project.description}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--border-subtle)] pt-4 text-xs text-text-tertiary">
            <span className="inline-flex items-center gap-1.5">
              <User size={12} />
              {project.owner}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={12} />
              {project.memberCount} members
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Network size={12} />
              {project.graphCount} graphs
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} />
              Updated {project.lastModified}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
