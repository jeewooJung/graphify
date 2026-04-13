'use client'

import { Plus } from 'lucide-react'
import { Button, PageHeader } from '@/components/ui'
import type { ProjectSummary } from '@/types/document'

type ProjectDocumentsHeaderProps = {
  project: ProjectSummary
  totalCount: number
  canUpload: boolean
  onOpenUpload: () => void
}

export function ProjectDocumentsHeader({
  project,
  totalCount,
  canUpload,
  onOpenUpload,
}: ProjectDocumentsHeaderProps) {
  return (
    <PageHeader
      title={project.name}
      description={`Documents \u00B7 ${totalCount}`}
      actions={(
        <Button type="button" onClick={onOpenUpload} disabled={!canUpload}>
          <Plus size={16} />
          Upload documents
        </Button>
      )}
    />
  )
}
