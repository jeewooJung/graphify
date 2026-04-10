import React from 'react'
import { ProtectedAppShell } from '@/components/auth/ProtectedAppShell'

export default function GraphsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedAppShell mainClassName="overflow-hidden">{children}</ProtectedAppShell>
  )
}
