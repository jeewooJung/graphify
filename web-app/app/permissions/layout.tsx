import React from 'react'
import { AppShell } from '@/components/layout'

export default function PermissionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
