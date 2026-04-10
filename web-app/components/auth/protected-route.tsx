'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/auth/user-context'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="app-card rounded-[28px] px-8 py-6 text-center">
          <p className="text-sm text-text-tertiary">Loading workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return <>{children}</>
}
