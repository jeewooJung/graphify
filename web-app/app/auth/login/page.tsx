'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/components/ui'
import { ArrowRight, Network, ShieldCheck, Sparkles } from 'lucide-react'

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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-border bg-white/82 shadow-card backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative overflow-hidden border-b border-border px-7 py-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,110,247,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(247,248,251,0.8)_100%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              <Sparkles size={14} className="text-primary-500" />
              Linear-inspired workspace
            </div>

            <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-500 text-white shadow-panel">
              <Network size={24} />
            </div>

            <h1 className="mt-6 max-w-md text-[40px] font-semibold tracking-[-0.06em] text-text-primary">
              Graphify keeps knowledge graphs calm, reviewable, and fast.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-text-secondary">
              A light, focused workspace for graph operations. Explore entities, manage permissions, and keep project context aligned without visual noise.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                'Structured graph operations with crisp hierarchy',
                'Shared review cycles for teams and projects',
                'Permission-aware workflows without admin clutter',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-white/72 px-4 py-3 text-sm text-text-secondary"
                >
                  <ShieldCheck size={16} className="text-primary-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-7 py-8 lg:px-10 lg:py-10">
          <div className="max-w-md">
            <div className="mb-8">
              <div className="page-eyebrow mb-3">Sign in</div>
              <h2 className="text-[32px] font-semibold tracking-[-0.05em] text-text-primary">
                Continue to your workspace
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Use the demo credentials below or sign in with your own connected account.
              </p>
            </div>

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
                placeholder="Enter your password"
                required
              />

              {error && (
                <div className="rounded-2xl border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-500">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full justify-center"
              >
                {loading ? 'Signing in...' : 'Sign in to Graphify'}
                {!loading && <ArrowRight size={16} />}
              </Button>
            </form>

            <div className="mt-6 rounded-3xl border border-border bg-surface-hover px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                Demo credentials
              </p>
              <div className="mt-3 space-y-2 text-sm text-text-secondary">
                <p>
                  Email:{' '}
                  <code className="rounded bg-white px-2 py-1 text-text-primary">demo@graphify.com</code>
                </p>
                <p>
                  Password:{' '}
                  <code className="rounded bg-white px-2 py-1 text-text-primary">demo123</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
