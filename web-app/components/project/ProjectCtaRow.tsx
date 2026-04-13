'use client'

import { Button } from '@/components/ui'

type ProjectCtaRowProps = {
  projectId: string
  canUpload: boolean
  onAsk: () => void
  onOpenDocuments: () => void
  onOpenUpload: () => void
}

export function ProjectCtaRow({
  projectId,
  canUpload,
  onAsk,
  onOpenDocuments,
  onOpenUpload,
}: ProjectCtaRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-3" data-project-id={projectId}>
      <Button type="button" onClick={onAsk}>
        Ask this project
      </Button>
      <Button type="button" variant="secondary" onClick={onOpenDocuments}>
        Open documents
      </Button>
      <Button type="button" variant="secondary" onClick={onOpenUpload} disabled={!canUpload}>
        Upload documents
      </Button>
    </div>
  )
}
