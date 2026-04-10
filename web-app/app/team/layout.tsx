import React from 'react'
import { AppShell } from '@/components/layout'

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
