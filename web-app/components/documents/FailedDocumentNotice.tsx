'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui'

type FailedDocumentNoticeProps = {
  failedCount: number
  onFilterFailed: () => void
  onDismiss?: () => void
}

export function FailedDocumentNotice({
  failedCount,
  onFilterFailed,
  onDismiss,
}: FailedDocumentNoticeProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (!failedCount || isDismissed) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-error-500/20 bg-error-50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-error-500">
        <AlertTriangle size={16} />
        <span>{`${failedCount}\uAC1C \uBB38\uC11C \uC5C5\uB85C\uB4DC \uC2E4\uD328 \u2014 \uC0C1\uD0DC\uB97C \uD655\uC778\uD558\uC138\uC694`}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onFilterFailed}>
          \uC2E4\uD328\uB9CC \uBCF4\uAE30
        </Button>
        {onDismiss ? (
          <button
            type="button"
            aria-label="Dismiss failed documents notice"
            onClick={() => {
              setIsDismissed(true)
              onDismiss()
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-error-500/15 bg-white text-error-500 transition-colors hover:bg-error-50"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
