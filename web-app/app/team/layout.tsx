import React from 'react'
import { ProtectedAppShell } from '@/components/auth/ProtectedAppShell'

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>
}
