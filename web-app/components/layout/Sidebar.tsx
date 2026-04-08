'use client'

import React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui'
import {
  LayoutDashboard,
  Network,
  Search as SearchIcon,
  Users,
  FolderOpen,
  Lock,
  Plus,
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
      <span className="w-5 h-5 flex items-center justify-center">
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
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'w-60 bg-surface border-r border-border h-[calc(100vh-56px)] overflow-y-auto',
          'fixed left-0 top-14 md:relative md:top-0 z-40',
          'transition-transform duration-200 md:translate-x-0',
          !isOpen && '-translate-x-full md:translate-x-0'
        )}
      >
        <nav className="p-4 space-y-2">
          {/* Main Navigation */}
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

          {/* Divider */}
          <div className="h-px bg-border my-3" />

          {/* Admin Navigation */}
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

          {/* Divider */}
          <div className="h-px bg-border my-3" />

          {/* Quick Action */}
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center gap-2"
          >
            <Plus size={16} />
            <span>New Graph</span>
          </Button>
        </nav>
      </aside>
    </>
  )
}
