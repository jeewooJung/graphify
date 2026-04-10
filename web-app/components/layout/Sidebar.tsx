'use client'

import React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui'
import {
  FolderOpen,
  LayoutDashboard,
  Lock,
  Network,
  Plus,
  Search as SearchIcon,
  Users,
  X,
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive?: boolean
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={clsx(
        'nav-item',
        isActive && 'active'
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  )
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-[244px] transition-transform duration-200 md:sticky md:top-0 md:translate-x-0',
          !isOpen && '-translate-x-full md:translate-x-0'
        )}
      >
        <div
          className="flex h-full flex-col border-r border-border px-3 pb-4 pt-3"
          style={{ backgroundColor: 'var(--app-sidebar)' }}
        >
          <div className="mb-5 flex items-center justify-between gap-2 px-1">
            <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-[11px] font-semibold text-white">
                JJ
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-text-primary">jjw</div>
                <div className="text-[11px] text-text-tertiary">Graph intelligence</div>
              </div>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-text-secondary md:hidden"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 px-1">
            <Link
              href="/search"
              className="flex h-8 items-center justify-center gap-1 rounded-lg border border-border bg-white px-2 text-[12px] font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              <SearchIcon size={13} />
              Search
            </Link>
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-center"
            >
              <Plus size={13} />
              New
            </Button>
          </div>

          <nav className="flex-1 space-y-6">
            <div>
              <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                Workspace
              </div>
              <div className="space-y-1">
                <NavItem
                  href="/dashboard"
                  icon={<LayoutDashboard size={16} />}
                  label="Dashboard"
                  isActive={isActive('/dashboard')}
                />
                <NavItem
                  href="/graphs"
                  icon={<Network size={16} />}
                  label="Graphs"
                  isActive={isActive('/graphs')}
                />
                <NavItem
                  href="/search"
                  icon={<SearchIcon size={16} />}
                  label="Search"
                  isActive={isActive('/search')}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                Manage
              </div>
              <div className="space-y-1">
                <NavItem
                  href="/team"
                  icon={<Users size={16} />}
                  label="Team"
                  isActive={isActive('/team')}
                />
                <NavItem
                  href="/projects"
                  icon={<FolderOpen size={16} />}
                  label="Projects"
                  isActive={isActive('/projects')}
                />
                <NavItem
                  href="/permissions"
                  icon={<Lock size={16} />}
                  label="Permissions"
                  isActive={isActive('/permissions')}
                />
              </div>
            </div>
          </nav>

          <div className="mt-6 rounded-2xl border border-border bg-white/86 p-3 shadow-card">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              Current workspace
            </div>
            <div className="mt-2 text-sm font-medium text-text-primary">
              JJW Graph Lab
            </div>
            <p className="mt-1 text-[12px] leading-5 text-text-secondary">
              12 live graphs, 8 reviewers, and 3 approvals waiting this week.
            </p>
            <div className="mt-3 flex gap-2">
              <span className="app-chip">12 graphs</span>
              <span className="app-chip">98.4% healthy</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
