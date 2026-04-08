# Linear Light Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready Linear light-themed dashboard UI for Graphify using Next.js, React, and Tailwind CSS

**Architecture:** 
- Next.js 14+ with App Router for file-based routing
- Tailwind CSS with custom Linear light color palette
- Modular component structure (UI components + feature components)
- TypeScript for type safety
- Responsive design (mobile-first)

**Tech Stack:**
- Next.js 14+ (React 18+)
- TypeScript
- Tailwind CSS 3.4+
- Lucide React (icons)
- Shadcn/ui components (optional, can build custom)

---

## Phase 1: Project Setup & Styling Foundation

### Task 1: Create Next.js project with Tailwind CSS

**Files:**
- Create: `web-app/` directory (new)
- Create: `web-app/package.json`
- Create: `web-app/tailwind.config.ts`
- Create: `web-app/tsconfig.json`
- Create: `web-app/next.config.js`

**Step 1: Initialize Next.js with Tailwind**

Run:
```bash
cd c:/workspaceRND/graphify/graphify
npx create-next-app@latest web-app --typescript --tailwind --no-git --no-eslint
cd web-app
npm install
```

Expected: Next.js project created with Tailwind configured

**Step 2: Install additional dependencies**

Run:
```bash
npm install lucide-react clsx tailwind-merge
npm install -D @types/node
```

**Step 3: Verify project structure**

Run:
```bash
ls -la web-app/
```

Expected output should show:
```
app/
  layout.tsx
  page.tsx
components/
public/
package.json
tsconfig.json
tailwind.config.ts
next.config.js
```

**Step 4: Commit**

```bash
cd c:/workspaceRND/graphify/graphify
git add web-app/
git commit -m "feat: initialize Next.js project with Tailwind CSS"
```

---

### Task 2: Configure Tailwind with Linear light color palette

**Files:**
- Modify: `web-app/tailwind.config.ts`
- Create: `web-app/src/styles/globals.css`

**Step 1: Update tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Linear light palette
        background: '#ffffff',
        surface: '#fafafa',
        'surface-hover': '#f9fafb',
        border: '#e5e7eb',
        'border-light': '#f3f4f6',
        
        // Text colors
        'text-primary': '#1f2937',
        'text-secondary': '#6b7280',
        'text-tertiary': '#9ca3af',
        
        // Brand color (Blue)
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#3366cc',  // Main accent
          600: '#2d5ab8',  // Hover
          700: '#1e3a73',  // Active
          800: '#1e40af',
          900: '#1e3a8a',
        },
        
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      
      fontSize: {
        xs: ['11px', { lineHeight: '16px' }],
        sm: ['12px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '20px' }],
        lg: ['16px', { lineHeight: '24px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['28px', { lineHeight: '36px' }],
        '3xl': ['36px', { lineHeight: '44px' }],
        '4xl': ['48px', { lineHeight: '60px' }],
      },
      
      boxShadow: {
        'none': 'none',
        'xs': '0 1px 2px #f0f0f0',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'md': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'lg': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      
      transitionDuration: {
        default: '150ms',
        fast: '100ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
}

export default config
```

**Step 2: Update globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Linear light theme */
@layer base {
  body {
    @apply bg-white text-text-primary;
  }
  
  a {
    @apply text-primary-500 hover:text-primary-600 transition-colors duration-150;
  }
}

/* Utility classes for common patterns */
@layer components {
  .btn-primary {
    @apply px-4 py-2 h-9 bg-primary-500 text-white rounded-md hover:bg-primary-600 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-150 font-medium text-sm;
  }
  
  .btn-secondary {
    @apply px-4 py-2 h-9 bg-transparent text-primary-500 border border-border rounded-md hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-150 font-medium text-sm;
  }
  
  .btn-ghost {
    @apply px-4 py-2 h-9 bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-150 font-medium text-sm;
  }
  
  .input-field {
    @apply w-full px-3 py-2 h-9 border border-border rounded-md bg-white text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 transition-colors duration-150;
  }
  
  .card {
    @apply rounded-lg border border-border bg-white p-4 hover:bg-surface-hover transition-colors duration-150;
  }
}
```

**Step 3: Update app/layout.tsx**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Graphify Dashboard',
  description: 'Knowledge graph visualization platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

**Step 4: Commit**

```bash
cd web-app
git add tailwind.config.ts src/styles/globals.css app/layout.tsx
git commit -m "style: configure Tailwind with Linear light color palette"
```

---

## Phase 2: Base Components

### Task 3: Create reusable UI components

**Files:**
- Create: `web-app/src/components/ui/Button.tsx`
- Create: `web-app/src/components/ui/Input.tsx`
- Create: `web-app/src/components/ui/Card.tsx`
- Create: `web-app/src/components/ui/Badge.tsx`
- Create: `web-app/src/components/ui/Icon.tsx`

**Step 1: Create Button.tsx**

```typescript
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

const buttonVariants = cva(
  'inline-flex items-center justify-center h-9 px-4 rounded-md font-medium text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-transparent text-primary-500 border border-border hover:bg-surface-hover focus:ring-primary-500',
        ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover focus:ring-primary-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={clsx(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)

Button.displayName = 'Button'

export { Button, buttonVariants }
```

**Step 2: Create Input.tsx**

```typescript
import React from 'react'
import clsx from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}
        <input
          className={clsx(
            'w-full h-9 px-3 py-2 border rounded-md bg-white text-text-primary placeholder-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-colors duration-150',
            'disabled:bg-surface disabled:text-text-tertiary disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            !error && 'border-border hover:border-border-light',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
)

Input.displayName = 'Input'

export { Input }
```

**Step 3: Create Card.tsx**

```typescript
import React from 'react'
import clsx from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      className={clsx(
        'rounded-lg border border-border bg-white p-4',
        'hover:bg-surface-hover transition-colors duration-150',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
)

Card.displayName = 'Card'

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      className={clsx('border-b border-border pb-4 mb-4', className)}
      ref={ref}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      className={clsx('text-lg font-semibold text-text-primary', className)}
      ref={ref}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div className={clsx('text-sm text-text-secondary', className)} ref={ref} {...props} />
  )
)

CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
```

**Step 4: Create Badge.tsx**

```typescript
import React from 'react'
import clsx from 'clsx'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'default'
  children: React.ReactNode
}

const badgeVariants = {
  primary: 'bg-blue-100 text-primary-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  default: 'bg-surface text-text-secondary',
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium',
        badgeVariants[variant],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  )
)

Badge.displayName = 'Badge'

export { Badge }
```

**Step 5: Create Icon.tsx**

```typescript
import React from 'react'
import clsx from 'clsx'

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number | string
  className?: string
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 16, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx('inline-block', className)}
      {...props}
    />
  )
)

Icon.displayName = 'Icon'

export { Icon }
```

**Step 6: Create index.ts for components**

```typescript
// web-app/src/components/ui/index.ts
export { Button, buttonVariants } from './Button'
export { Input } from './Input'
export { Card, CardHeader, CardTitle, CardContent } from './Card'
export { Badge } from './Badge'
export { Icon } from './Icon'
```

**Step 7: Commit**

```bash
cd web-app
git add src/components/ui/
git commit -m "feat: create reusable UI components (Button, Input, Card, Badge)"
```

---

## Phase 3: Layout Components

### Task 4: Create Header component

**Files:**
- Create: `web-app/src/components/layout/Header.tsx`

**Step 1: Write Header.tsx**

```typescript
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
```

**Step 2: Commit**

```bash
cd web-app
git add src/components/layout/Header.tsx
git commit -m "feat: create Header component"
```

---

### Task 5: Create Sidebar component

**Files:**
- Create: `web-app/src/components/layout/Sidebar.tsx`
- Create: `web-app/src/components/layout/NavItem.tsx`

**Step 1: Write NavItem.tsx**

```typescript
'use client'

import React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
}

export function NavItem({ href, icon, label }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 px-3 py-2 h-8 rounded-md text-sm font-medium',
        'transition-colors duration-150',
        isActive
          ? 'bg-blue-100 text-primary-500 border-l-3 border-primary-500 pl-2.5'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
      )}
    >
      <span className="w-5 h-5 flex items-center justify-center">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  )
}
```

**Step 2: Write Sidebar.tsx**

```typescript
'use client'

import React from 'react'
import clsx from 'clsx'
import { Button } from '@/components/ui'
import { NavItem } from './NavItem'
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

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
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
            />
            <NavItem
              href="/graphs"
              icon={<Network size={16} />}
              label="Graphs"
            />
            <NavItem
              href="/search"
              icon={<SearchIcon size={16} />}
              label="Search"
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
            />
            <NavItem
              href="/projects"
              icon={<FolderOpen size={16} />}
              label="Projects"
            />
            <NavItem
              href="/permissions"
              icon={<Lock size={16} />}
              label="Permissions"
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
```

**Step 3: Create layout index**

```typescript
// web-app/src/components/layout/index.ts
export { Header } from './Header'
export { Sidebar, type SidebarProps } from './Sidebar'
export { NavItem } from './NavItem'
```

**Step 4: Commit**

```bash
cd web-app
git add src/components/layout/
git commit -m "feat: create Sidebar and Header layout components"
```

---

## Phase 4: Dashboard Page

### Task 6: Create Dashboard layout and page

**Files:**
- Create: `web-app/src/app/dashboard/page.tsx`
- Create: `web-app/src/app/dashboard/layout.tsx`
- Create: `web-app/src/components/dashboard/RecentGraphs.tsx`
- Create: `web-app/src/components/dashboard/TeamActivity.tsx`
- Create: `web-app/src/components/dashboard/Statistics.tsx`

**Step 1: Create dashboard layout.tsx**

```typescript
'use client'

import React, { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Step 2: Create RecentGraphs.tsx**

```typescript
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { MoreHorizontal, Star } from 'lucide-react'

interface Graph {
  id: string
  name: string
  description: string
  updatedAt: string
  itemCount: number
}

const mockGraphs: Graph[] = [
  {
    id: '1',
    name: 'Company Knowledge Graph',
    description: 'Main knowledge base for company',
    updatedAt: '2 hours ago',
    itemCount: 245,
  },
  {
    id: '2',
    name: 'Product Architecture',
    description: 'System design and components',
    updatedAt: '1 day ago',
    itemCount: 89,
  },
  {
    id: '3',
    name: 'Team Skills Matrix',
    description: 'Team expertise and capabilities',
    updatedAt: '3 days ago',
    itemCount: 42,
  },
]

export function RecentGraphs() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Graphs</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockGraphs.map((graph) => (
            <div
              key={graph.id}
              className="flex items-center justify-between p-3 rounded-md hover:bg-surface-hover transition-colors cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-text-primary truncate">
                    {graph.name}
                  </h4>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star size={14} className="text-text-tertiary" />
                  </button>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {graph.description} • {graph.itemCount} items
                </p>
              </div>
              <span className="text-xs text-text-tertiary ml-4 whitespace-nowrap">
                {graph.updatedAt}
              </span>
              <button className="ml-2 p-1 rounded hover:bg-surface opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={16} className="text-text-tertiary" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 3: Create TeamActivity.tsx**

```typescript
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { User, MessageSquare, Edit2 } from 'lucide-react'

interface Activity {
  id: string
  user: string
  action: string
  timestamp: string
  icon: 'edit' | 'comment' | 'user'
}

const mockActivity: Activity[] = [
  {
    id: '1',
    user: 'Sarah Chen',
    action: 'Updated "Product Architecture" graph',
    timestamp: '1 hour ago',
    icon: 'edit',
  },
  {
    id: '2',
    user: 'James Wilson',
    action: 'Added comment to "Company Knowledge Graph"',
    timestamp: '3 hours ago',
    icon: 'comment',
  },
  {
    id: '3',
    user: 'Emma Davis',
    action: 'Joined the workspace',
    timestamp: '1 day ago',
    icon: 'user',
  },
]

const iconMap = {
  edit: Edit2,
  comment: MessageSquare,
  user: User,
}

export function TeamActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockActivity.map((activity) => {
            const Icon = iconMap[activity.icon]
            return (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Icon size={14} className="text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{activity.user}</span>
                    {' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 4: Create Statistics.tsx**

```typescript
import React from 'react'
import { Card, CardContent } from '@/components/ui'

interface Stat {
  label: string
  value: string | number
  trend?: 'up' | 'down'
  trendValue?: string
}

const stats: Stat[] = [
  {
    label: 'Total Graphs',
    value: 12,
    trend: 'up',
    trendValue: '+2 this month',
  },
  {
    label: 'Team Members',
    value: 8,
    trend: 'up',
    trendValue: '+1 this week',
  },
  {
    label: 'Total Nodes',
    value: 1240,
    trend: 'up',
    trendValue: '+89 this week',
  },
]

export function Statistics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx}>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
            <h3 className="text-3xl font-semibold text-text-primary mb-2">
              {stat.value}
            </h3>
            {stat.trend && (
              <p
                className={`text-xs font-medium ${
                  stat.trend === 'up'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.trend === 'up' ? '↑' : '↓'} {stat.trendValue}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**Step 5: Create dashboard page.tsx**

```typescript
'use client'

import React from 'react'
import { RecentGraphs } from '@/components/dashboard/RecentGraphs'
import { TeamActivity } from '@/components/dashboard/TeamActivity'
import { Statistics } from '@/components/dashboard/Statistics'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-3xl font-semibold text-text-primary">
          Dashboard
        </h1>
        <p className="text-text-secondary mt-1">
          Welcome back! Here's what's happening with your graphs.
        </p>
      </div>

      {/* Content Section */}
      <div className="px-8 py-8">
        {/* Statistics Grid */}
        <div className="mb-8">
          <Statistics />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recent Graphs (takes 2 cols on large screens) */}
          <div className="lg:col-span-2">
            <RecentGraphs />
          </div>

          {/* Right Column - Team Activity */}
          <div>
            <TeamActivity />
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 6: Create components index**

```typescript
// web-app/src/components/dashboard/index.ts
export { RecentGraphs } from './RecentGraphs'
export { TeamActivity } from './TeamActivity'
export { Statistics } from './Statistics'
```

**Step 7: Update root page.tsx**

```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

**Step 8: Commit**

```bash
cd web-app
git add src/app/dashboard/ src/components/dashboard/ src/app/page.tsx
git commit -m "feat: create dashboard page with statistics, recent graphs, and team activity"
```

---

## Phase 5: Testing & Verification

### Task 7: Run development server and verify

**Step 1: Start development server**

```bash
cd web-app
npm run dev
```

Expected output:
```
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

**Step 2: Test in browser**

Open `http://localhost:3000` and verify:
- [ ] Dashboard page loads
- [ ] Header visible with logo and search bar
- [ ] Sidebar visible with navigation items
- [ ] Statistics cards display (3 cards in desktop view)
- [ ] Recent graphs table visible
- [ ] Team activity section visible
- [ ] Responsive design works on mobile (sidebar hidden, hamburger menu visible)
- [ ] All buttons are clickable
- [ ] Hover states work (cards, buttons, menu items)

**Step 3: Verify styling matches Linear light**

Check:
- [ ] White background (#ffffff)
- [ ] Light gray surface (#fafafa)
- [ ] Blue accent color (#3366cc)
- [ ] Text colors (primary #1f2937, secondary #6b7280)
- [ ] Border colors (#e5e7eb)
- [ ] Rounded corners (4-8px)
- [ ] Minimal shadows

**Step 4: Take screenshot**

```bash
# Optional: use browser DevTools to take a screenshot
# Save as web-app/screenshots/dashboard-light.png
```

**Step 5: Commit**

```bash
cd web-app
git add .
git commit -m "test: verify dashboard layout and Linear light styling"
```

---

## Summary

**Total Tasks:** 7  
**Estimated Time:** 2-3 hours  
**Deliverables:**
- ✅ Next.js project with Tailwind CSS
- ✅ Linear light color palette configured
- ✅ Reusable UI components (Button, Input, Card, Badge)
- ✅ Layout components (Header, Sidebar, NavItem)
- ✅ Dashboard page with 3 sections (Statistics, Recent Graphs, Team Activity)
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Interactive hover/focus states

**Next Steps:**
1. Implement Graph Visualization page (3-panel layout)
2. Implement Search page
3. Add remaining pages (Team, Projects, Permissions, Node Details)
4. Connect to backend API
5. Add form handling and state management
6. Write E2E tests

---

**Commit History:**
```
9782c51 Implement complete Figma design system following Impeccable guidelines
XXXX Initialize Next.js project with Tailwind CSS
XXXX Configure Tailwind with Linear light color palette
XXXX Create reusable UI components
XXXX Create Header and Sidebar layout components
XXXX Create dashboard page
XXXX Verify dashboard layout and styling
```
