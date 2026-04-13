'use client'

import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/ui'

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <div className="page-shell">
      <PageHeader title="Project" />
      <p>Project: {projectId}</p>
    </div>
  )
}
