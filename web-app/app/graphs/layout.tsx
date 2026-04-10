'use client'

import React from 'react'
import { AppShell } from '@/components/layout'

export default function GraphsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell mainClassName="overflow-hidden">{children}</AppShell>
  )
}
