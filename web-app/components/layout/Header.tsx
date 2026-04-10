'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Plus,
  Search,
} from 'lucide-react'
import { useUser } from '@/lib/auth/user-context'

interface HeaderProps {
  onMenuToggle?: () => void
}

const ROUTE_COPY: Record<string, { label: string }> = {
  '/dashboard': {
    label: 'Overview',
  },
  '/graphs': {
    label: 'Graph Studio',
  },
  '/search': {
    label: 'Search',
  },
  '/team': {
    label: 'Team',
  },
  '/projects': {
    label: 'Projects',
  },
  '/permissions': {
    label: 'Permissions',
  },
}

export function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useUser()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const pageCopy =
    ROUTE_COPY[Object.keys(ROUTE_COPY).find((route) => pathname.startsWith(route)) || '/dashboard']

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header
      className="sticky top-0 z-30 border-b border-border backdrop-blur-md"
      style={{ backgroundColor: 'rgba(247, 247, 244, 0.9)' }}
    >
      <div className="flex h-14 items-center gap-3 px-4 md:px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="!h-8 !w-8 !rounded-lg !px-0 md:hidden"
        >
          <Menu size={16} />
        </Button>

        <div className="hidden min-w-0 items-center gap-2 md:flex">
          <span className="text-[12px] font-medium text-text-tertiary">Workspace</span>
          <span className="text-[12px] text-text-quaternary">/</span>
          <span className="truncate text-[12px] font-medium text-text-primary">{pageCopy.label}</span>
        </div>

        <div className="mx-auto hidden lg:flex">
          <div className="flex items-center gap-3 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] text-text-secondary shadow-panel">
            <span>Schema review queue is quiet today</span>
            <button
              type="button"
              className="font-semibold text-text-primary transition-colors hover:text-primary-600"
              onClick={() => router.push('/dashboard')}
            >
              Open workspace
            </button>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/search')}
            className="!h-8 !w-8 !rounded-lg !px-0"
          >
            <Search size={15} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="!h-8 !w-8 !rounded-lg !px-0"
          >
            <Bell size={15} />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="hidden md:inline-flex"
          >
            <Plus size={14} />
            New graph
          </Button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-full border border-border bg-white px-1.5 py-1 shadow-panel transition-colors hover:bg-white"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-[11px] font-semibold text-white">
                {initials || 'GU'}
              </div>
              <div className="hidden pr-1 text-left md:block">
                <div className="text-[12px] font-medium text-text-primary">
                  {user?.name || 'Guest user'}
                </div>
                <div className="text-[11px] text-text-tertiary">
                  {user?.role || 'viewer'}
                </div>
              </div>
              <ChevronDown size={14} className="hidden text-text-tertiary md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-white shadow-card">
                <div className="border-b border-border px-4 py-4">
                  <p className="text-sm font-semibold text-text-primary">
                    {user?.name || 'Guest user'}
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {user?.email || 'Authentication pending'}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover"
                  >
                    <LogOut size={16} className="text-text-tertiary" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
