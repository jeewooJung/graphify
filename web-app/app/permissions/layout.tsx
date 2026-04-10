import React from 'react'
import { ProtectedAppShell } from '@/components/auth/ProtectedAppShell'

export default function PermissionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>
}
