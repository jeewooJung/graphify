import React from 'react'
import { ProtectedAppShell } from '@/components/auth/ProtectedAppShell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedAppShell>{children}</ProtectedAppShell>
  )
}
