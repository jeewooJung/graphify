# User Authentication Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement user authentication with login/logout, session management, and protected routes

**Architecture:**
- Simple cookie-based session management (client-side + API routes)
- Login page with email/password form
- Protected routes via middleware
- User context for state management
- Session validation on page load
- Logout functionality in header

**Tech Stack:**
- Next.js 14 (App Router + Middleware)
- React Context API (user state)
- Cookies (session storage)
- API Routes (login/logout/validate endpoints)

---

## Phase 1: Create Authentication Components and Pages

### Task 1: Create Login Page

**Files:**
- Create: `web-app/app/auth/login/page.tsx`

**Step 1: Create login page**

```typescript
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Login failed')
        setLoading(false)
        return
      }

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#ffffff' }} className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-semibold mb-2">
            Graphify
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Knowledge Graph Platform
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <div style={{ backgroundColor: '#fee2e2', borderColor: '#fecaca', borderWidth: '1px' }} className="p-3 rounded text-sm" style={{ color: 'var(--color-error)' }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderWidth: '1px' }} className="mt-6 p-4 rounded">
          <p style={{ color: 'var(--color-text-tertiary)' }} className="text-xs mb-2 font-semibold">
            Demo Credentials:
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs">
            Email: <code className="font-mono">demo@graphify.com</code>
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs">
            Password: <code className="font-mono">demo123</code>
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

### Task 2: Create User Context

**Files:**
- Create: `web-app/lib/auth/user-context.tsx`

**Step 1: Create user context**

```typescript
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
}

interface UserContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Validate session on mount
  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await fetch('/api/auth/validate', {
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (err) {
        console.error('Session validation failed:', err)
      } finally {
        setLoading(false)
      }
    }

    validateSession()
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
```

---

### Task 3: Create Auth API Routes

**Files:**
- Create: `web-app/app/api/auth/login/route.ts`
- Create: `web-app/app/api/auth/logout/route.ts`
- Create: `web-app/app/api/auth/validate/route.ts`

**Step 1: Create login API**

```typescript
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Mock user database
const USERS = [
  {
    id: '1',
    email: 'demo@graphify.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'admin' as const,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      )
    }

    // Find user (in production, query database)
    const user = USERS.find(u => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session cookie
    const cookieStore = cookies()
    cookieStore.set('sessionId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 2: Create logout API**

```typescript
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    cookieStore.delete('sessionId')

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    )
  }
}
```

**Step 3: Create validate API**

```typescript
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Mock user database
const USERS = [
  {
    id: '1',
    email: 'demo@graphify.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'admin' as const,
  },
]

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Find user by session ID
    const user = USERS.find(u => u.id === sessionId)

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      )
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    return NextResponse.json(
      { message: 'Validation failed' },
      { status: 500 }
    )
  }
}
```

---

### Task 4: Update Header with Logout

**Files:**
- Modify: `web-app/components/layout/Header.tsx`

Update the Header component to add logout button in user menu:

```typescript
// Add to existing Header component in user menu section:
<div className="flex items-center gap-2">
  {/* Notifications */}
  <button className="btn-ghost h-8 px-3 text-xs">
    <Bell size={18} />
  </button>

  {/* User Menu with Logout */}
  <div className="relative group">
    <button className="btn-ghost h-8 px-3 text-xs flex items-center gap-2">
      <User size={18} />
    </button>
    <div className="absolute right-0 mt-1 w-48 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
      <div className="p-3 border-b border-border">
        <p style={{ color: 'var(--color-text-primary)' }} className="text-sm font-semibold">
          {user?.name}
        </p>
        <p style={{ color: 'var(--color-text-tertiary)' }} className="text-xs">
          {user?.email}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover text-text-primary"
      >
        Sign Out
      </button>
    </div>
  </div>
</div>
```

---

### Task 5: Create Protected Route Wrapper

**Files:**
- Create: `web-app/components/auth/protected-route.tsx`

**Step 1: Create protected route wrapper**

```typescript
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/auth/user-context'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--color-text-tertiary)' }}>Loading...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return <>{children}</>
}
```

---

### Task 6: Update Root Layout with UserProvider

**Files:**
- Modify: `web-app/app/layout.tsx`

Add UserProvider wrapper:

```typescript
import { UserProvider } from '@/lib/auth/user-context'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body className="min-h-screen bg-white text-text-primary">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
```

---

### Task 7: Verify and Commit

**Files:**
- Verify: All new auth files
- Verify: Header updated with logout
- Verify: Layout updated with UserProvider

**Step 1: Commit**

```bash
cd web-app
git add app/auth/ app/api/auth/ lib/auth/ components/layout/Header.tsx components/auth/ app/layout.tsx
git commit -m "feat: implement user authentication with login/logout and session management"
```

**Step 2: Test**

```bash
npm run dev
# Navigate to http://localhost:3000/auth/login
# Test login with:
#   Email: demo@graphify.com
#   Password: demo123
# Verify redirect to dashboard
# Test logout from user menu
# Verify redirect back to login
```

---

## Summary

**Total Tasks:** 7  
**Estimated Time:** 1-1.5 hours  
**Deliverables:**
- ✅ Login page with form
- ✅ User context for state management
- ✅ API routes (login, logout, validate)
- ✅ Session management via cookies
- ✅ Logout button in header
- ✅ Protected route wrapper
- ✅ Demo credentials (demo@graphify.com / demo123)

---

**Next Phase:** Connect Backend API for real graph data
