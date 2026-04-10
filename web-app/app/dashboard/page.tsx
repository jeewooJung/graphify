'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Sparkles, Upload } from 'lucide-react'
import { RecentGraphs, TeamActivity, Statistics } from '@/components/dashboard'
import { Button } from '@/components/ui'

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="page-shell">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-10 pt-8 text-center md:pb-12 md:pt-10">
        <div className="mb-8 flex items-center gap-3 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] text-text-secondary shadow-panel">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
          Workspace is current and ready for review
          <button
            type="button"
            className="font-semibold text-text-primary transition-colors hover:text-primary-600"
            onClick={() => router.push('/graphs')}
          >
            Open graphs
          </button>
        </div>

        <div className="relative flex h-28 w-28 items-center justify-center">
          <div
            className="absolute inset-2 rounded-full border border-border"
            style={{ background: 'radial-gradient(circle at center, rgba(79, 110, 247, 0.08), transparent 70%)' }}
          />
          <div className="absolute inset-0 rounded-full border border-border border-dashed" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-primary-600 shadow-panel">
            <Sparkles size={18} />
          </div>
        </div>

        <div className="page-eyebrow mt-6 mb-0">Graph intelligence</div>
        <h1 className="mt-2 max-w-2xl text-[32px] font-semibold tracking-[-0.06em] text-text-primary md:text-[40px]">
          Welcome to your graph workspace
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
          Search entities, review schema changes, and start graph work from one calm surface.
        </p>

        <div className="mt-6 w-full max-w-[580px] rounded-[18px] border border-border bg-white p-3 shadow-card">
          <button
            type="button"
            onClick={() => router.push('/search')}
            className="flex min-h-[84px] w-full rounded-[14px] border border-dashed border-border px-4 py-4 text-left transition-colors hover:bg-surface-hover"
            style={{ backgroundColor: 'rgba(247, 247, 244, 0.7)' }}
          >
            <div>
              <div className="text-[13px] font-medium text-text-tertiary">Ask Graphify...</div>
              <div className="mt-2 text-sm leading-6 text-text-secondary">
                Search entities, follow relationships, or jump into a graph.
              </div>
            </div>
          </button>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="app-chip">Entity search</span>
              <span className="app-chip">Review queue</span>
              <span className="app-chip">Schema checks</span>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Upload size={14} />
                Import
              </Button>
              <Button variant="primary" size="sm">
                <Plus size={14} />
                New graph
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <div className="space-y-4">
          <Statistics />
          <RecentGraphs />
        </div>
        <TeamActivity />
      </div>
    </div>
  )
}
