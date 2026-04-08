'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { Button } from '@/components/ui'
import { Menu, Search, Bell, User, LogOut } from 'lucide-react'
import { useUser } from '@/lib/auth/user-context'

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter()
  const { user, logout } = useUser()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  return (
    <header className={clsx(
      'h-14 bg-white border-b border-border',
      'flex items-center justify-between px-6',
      'sticky top-0 z-40',
      'shadow-xs'
    )}>
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="md:hidden"
        >
          <Menu size={18} />
        </Button>
        <h1 className="text-lg font-semibold text-text-primary hidden sm:block">
          Graphify
        </h1>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-xs mx-6 relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          type="text"
          placeholder="Search..."
          className={clsx(
            'w-full h-9 pl-9 pr-3 rounded-md bg-surface border border-border',
            'text-sm text-text-primary placeholder-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-colors duration-150'
          )}
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Bell size={18} />
        </Button>

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2"
          >
            <User size={18} />
          </Button>

          {/* Dropdown Menu */}
          {showUserMenu && user && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-lg shadow-lg z-50"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="p-4 border-b" style={{ borderBottomColor: 'var(--color-border)' }}>
                <p style={{ color: 'var(--color-text-primary)' }} className="text-sm font-semibold">
                  {user.name}
                </p>
                <p style={{ color: 'var(--color-text-tertiary)' }} className="text-xs">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface transition-colors"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
