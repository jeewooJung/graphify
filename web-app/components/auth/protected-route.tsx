'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/auth/user-context'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--color-text-tertiary)' }}>Loading...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return <>{children}</>
}
