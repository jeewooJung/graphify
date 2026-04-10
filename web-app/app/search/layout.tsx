import React from 'react'
import { AppShell } from '@/components/layout'

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
