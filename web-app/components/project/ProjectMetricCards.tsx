'use client'

import { Card } from '@/components/ui'
import type { ProjectMetrics } from '@/types/document'

type ProjectMetricCardsProps = {
  metrics: ProjectMetrics
  isLoading: boolean
}

function formatRelativeTime(value?: string) {
  if (!value) return '없음'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '없음'

  const diffMs = date.getTime() - Date.now()
  const formatter = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' })
  const units = [
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ] as const

  for (const [unit, size] of units) {
    const amount = Math.round(diffMs / size)
    if (Math.abs(amount) >= 1) return formatter.format(amount, unit)
  }

  return '방금'
}

export function ProjectMetricCards({ metrics, isLoading }: ProjectMetricCardsProps) {
  const cards = [
    { label: '문서 수', value: String(metrics.documentCount) },
    { label: '최근 업로드', value: formatRelativeTime(metrics.lastUploadAt) },
    { label: '진행 중 작업', value: String(metrics.runningJobCount) },
    { label: '멤버 수', value: String(metrics.memberCount) },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-5">
          <p className="text-sm font-medium text-text-tertiary">{card.label}</p>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              <div className="h-7 w-20 animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
            </div>
          ) : (
            <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
              {card.value}
            </p>
          )}
        </Card>
      ))}
    </div>
  )
}
