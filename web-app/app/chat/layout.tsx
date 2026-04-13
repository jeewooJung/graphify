import React from 'react'
import { ProtectedAppShell } from '@/components/auth/ProtectedAppShell'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>
}
