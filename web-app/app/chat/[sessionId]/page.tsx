'use client'

import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/ui'

export default function ChatSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()

  return (
    <div className="page-shell">
      <PageHeader title="Chat session" />
      <p>Session: {sessionId}</p>
    </div>
  )
}
