import React from 'react'
import { ProtectedAppShell } from '@/components/auth/ProtectedAppShell'

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>
}
