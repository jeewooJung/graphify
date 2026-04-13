'use client'

import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/ui'

export default function ProjectDocumentsPage() {
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <div className="page-shell">
      <PageHeader title="Documents" />
      <p>documents for {projectId}</p>
    </div>
  )
}
