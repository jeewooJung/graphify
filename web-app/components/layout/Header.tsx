'use client'

import React from 'react'
import clsx from 'clsx'
import { Button } from '@/components/ui'
import { Menu, Search, Bell, User } from 'lucide-react'

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
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
        <Button variant="ghost" size="sm">
          <User size={18} />
        </Button>
      </div>
    </header>
  )
}
