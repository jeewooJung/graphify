'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui'

type PollingDisconnectedBannerProps = {
  visible: boolean
  onRetry: () => void
}

export function PollingDisconnectedBanner({
  visible,
  onRetry,
}: PollingDisconnectedBannerProps) {
  if (!visible) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning-500/30 bg-warning-50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-warning-900">
        <AlertTriangle size={16} />
        <span>작업 상태 갱신이 중단되었습니다 — 재연결 중</span>
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
