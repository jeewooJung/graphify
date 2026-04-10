import React from 'react'
import { Badge } from '@/components/ui'
import { ArrowUpRight, MoreHorizontal, Orbit, Star } from 'lucide-react'

interface Graph {
  id: string
  name: string
  description: string
  updatedAt: string
  itemCount: number
  state: 'Ready' | 'Review' | 'Draft'
}

const mockGraphs: Graph[] = [
  {
    id: '1',
    name: 'Company Knowledge Graph',
    description: 'Main knowledge base for company',
    updatedAt: '2 hours ago',
    itemCount: 245,
    state: 'Ready',
  },
  {
    id: '2',
    name: 'Product Architecture',
    description: 'System design and components',
    updatedAt: '1 day ago',
    itemCount: 89,
    state: 'Review',
  },
  {
    id: '3',
    name: 'Team Skills Matrix',
    description: 'Team expertise and capabilities',
    updatedAt: '3 days ago',
    itemCount: 42,
    state: 'Draft',
  },
]

export function RecentGraphs() {
  return (
    <div className="app-card overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
        <div>
          <div className="panel-heading">Recent graphs</div>
          <p className="mt-1 text-[13px] leading-6 text-text-secondary">
            High-signal projects that changed most recently.
          </p>
        </div>
        <button
          type="button"
          className="flex h-8 items-center gap-1 rounded-lg border border-border bg-white px-2.5 text-[12px] font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          Open all
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="divide-y divide-border">
        {mockGraphs.map((graph) => (
          <div
            key={graph.id}
            className="group flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-surface-hover"
          >
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Orbit size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-[13px] font-medium text-text-primary">
                    {graph.name}
                  </h4>
                  <Badge
                    variant={
                      graph.state === 'Ready'
                        ? 'success'
                        : graph.state === 'Review'
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {graph.state}
                  </Badge>
                </div>
                <p className="mt-1 text-[13px] leading-6 text-text-secondary">
                  {graph.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
                  <span className="app-chip">{graph.itemCount} items</span>
                  <span className="app-chip">Updated {graph.updatedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-white hover:text-text-primary"
              >
                <Star size={15} />
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-white hover:text-text-primary"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
