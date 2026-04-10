'use client'

import React, { useState } from 'react'
import clsx from 'clsx'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: React.ReactNode
  mainClassName?: string
}

export function AppShell({ children, mainClassName }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMenuToggle={() => setSidebarOpen((open) => !open)} />
          <main className={clsx('min-w-0 flex-1', mainClassName)}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
