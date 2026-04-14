'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorView } from '@/components/feedback'

function parseStatusFromError(error: Error & { digest?: string }) {
  const match = error.message.match(/\b([1-5]\d{2})\b/)
  const status = match ? Number(match[1]) : 500
  return status === 400 || status === 401 || status === 403 || status === 404 || status === 500 ? status : 500
}

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="page-shell">
      <ErrorView statusCode={parseStatusFromError(error)} onRetry={reset} onGoBack={() => router.push('/dashboard')} />
    </div>
  )
}
