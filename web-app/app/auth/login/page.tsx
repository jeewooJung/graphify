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
            <div style={{ backgroundColor: '#fee2e2', borderColor: '#fecaca', color: 'var(--color-error)' }} className="p-3 rounded text-sm border">
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
        <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="mt-6 p-4 rounded border">
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
