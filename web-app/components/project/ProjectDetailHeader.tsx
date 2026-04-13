'use client'

import { Badge, Button, PageHeader } from '@/components/ui'
import type { ProjectDetail } from '@/types/document'

type ProjectDetailHeaderProps = {
  project: ProjectDetail
  canEdit: boolean
  onEdit?: () => void
}

function getStatusMeta(status: ProjectDetail['status']) {
  return status === 'active'
    ? { label: 'active', variant: 'success' as const }
    : { label: 'archived', variant: 'default' as const }
}

export function ProjectDetailHeader({
  project,
  canEdit,
  onEdit,
}: ProjectDetailHeaderProps) {
  const status = getStatusMeta(project.status)

  return (
    <PageHeader
      className="mb-0"
      title={project.name}
      description={project.description}
      actions={(
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant={status.variant}>{status.label}</Badge>
          {project.teamName ? <span className="app-chip">{project.teamName}</span> : null}
          <span className="app-chip">Owner: {project.ownerName}</span>
          {canEdit ? (
            <Button type="button" variant="secondary" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
        </div>
      )}
    />
  )
}
