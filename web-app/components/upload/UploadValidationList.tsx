'use client'

import { AlertCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui'
import type { UploadValidation } from '@/types/document'

type UploadValidationListProps = {
  validations: UploadValidation[]
  onDismissFile: (fileId: string) => void
}

const CODE_LABELS: Record<UploadValidation['code'], string> = {
  unsupported_type: '지원하지 않는 형식',
  too_large: '파일 크기 초과',
  duplicate_filename: '동일 파일명 존재',
  permission: '권한 없음',
}

export function UploadValidationList({
  validations,
  onDismissFile,
}: UploadValidationListProps) {
  if (validations.length === 0) {
    return <p className="text-sm text-slate-500">모든 파일이 검증을 통과했습니다</p>
  }

  return (
    <div className="space-y-3">
      {validations.map((validation, index) => {
        const Icon = validation.severity === 'error' ? AlertTriangle : AlertCircle
        const accent = validation.severity === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-amber-200 bg-amber-50 text-amber-700'

        return (
          <div
            key={`${validation.fileId}-${validation.code}-${index}`}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${accent}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{CODE_LABELS[validation.code]}</p>
              <p className="mt-1 text-sm">{validation.message}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="text-current"
              onClick={() => onDismissFile(validation.fileId)}
            >
              제거
            </Button>
          </div>
        )
      })}
    </div>
  )
}
