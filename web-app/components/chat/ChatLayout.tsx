'use client'

import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Button, Card } from '@/components/ui'
import type { ChatScope } from '@/types/chat'

type ChatLayoutProps = {
  sessionId?: string
  scope?: ChatScope
  leftSlot?: React.ReactNode
  children: React.ReactNode
  rightSlot?: React.ReactNode
  onSessionListOpenChange?: (open: boolean) => void
  onSourcePanelOpenChange?: (open: boolean) => void
}

function useDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const apply = () => {
      const nextIsDesktop = mediaQuery.matches
      setIsDesktop((currentIsDesktop) => (currentIsDesktop === nextIsDesktop ? currentIsDesktop : nextIsDesktop))
    }

    apply()
    mediaQuery.addEventListener('change', apply)
    return () => mediaQuery.removeEventListener('change', apply)
  }, [])

  return isDesktop
}

function MobileDrawer({
  open,
  side,
  title,
  onClose,
  children,
}: {
  open: boolean
  side: 'left' | 'right'
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label={`Close ${title}`} />
      <Card
        className={clsx(
          'absolute inset-y-0 w-[min(90vw,360px)] rounded-none border-y-0 bg-white p-4 shadow-xl',
          side === 'left' ? 'left-0 border-l-0' : 'right-0 border-r-0'
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </Card>
    </div>
  )
}

export function ChatLayout({
  sessionId,
  scope,
  leftSlot,
  children,
  rightSlot,
  onSessionListOpenChange,
  onSourcePanelOpenChange,
}: ChatLayoutProps) {
  const isDesktop = useDesktop()
  const [isSessionListOpen, setIsSessionListOpen] = useState(false)
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false)

  useEffect(() => onSessionListOpenChange?.(isSessionListOpen), [isSessionListOpen, onSessionListOpenChange])
  useEffect(() => onSourcePanelOpenChange?.(isSourcePanelOpen), [isSourcePanelOpen, onSourcePanelOpenChange])
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsSessionListOpen(false)
        setIsSourcePanelOpen(false)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  if (isDesktop) {
    return (
      <div
        data-session-id={sessionId}
        data-scope-kind={scope?.kind}
        className={clsx(
          'grid min-h-0 gap-4',
          rightSlot ? 'md:grid-cols-[280px,minmax(0,1fr),360px]' : 'md:grid-cols-[280px,minmax(0,1fr)]'
        )}
      >
        <div className="min-w-0">{leftSlot}</div>
        <div className="min-w-0">{children}</div>
        {rightSlot ? <div className="min-w-0">{rightSlot}</div> : null}
      </div>
    )
  }

  return (
    <div data-session-id={sessionId} data-scope-kind={scope?.kind} className="flex min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-2 md:hidden">
        {leftSlot ? (
          <Button variant="secondary" size="sm" onClick={() => setIsSessionListOpen(true)} aria-label="Open session list">
            Sessions
          </Button>
        ) : <span />}
        {rightSlot ? (
          <Button variant="secondary" size="sm" onClick={() => setIsSourcePanelOpen(true)} aria-label="Open source panel">
            Sources
          </Button>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
      <MobileDrawer open={isSessionListOpen} side="left" title="session list" onClose={() => setIsSessionListOpen(false)}>
        {leftSlot}
      </MobileDrawer>
      <MobileDrawer open={isSourcePanelOpen} side="right" title="source panel" onClose={() => setIsSourcePanelOpen(false)}>
        {rightSlot}
      </MobileDrawer>
    </div>
  )
}
