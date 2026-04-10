import React from 'react'
import { AppShell } from '@/components/layout'
import { requireSessionUser } from '@/lib/auth/session'

interface ProtectedAppShellProps {
  children: React.ReactNode
  mainClassName?: string
}

export async function ProtectedAppShell({
  children,
  mainClassName,
}: ProtectedAppShellProps) {
  await requireSessionUser()

  return (
    <AppShell mainClassName={mainClassName}>
      {children}
    </AppShell>
  )
}
