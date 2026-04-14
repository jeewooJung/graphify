'use client'

import { AlertTriangle, ServerCrash, WifiOff } from 'lucide-react'
import { Badge, Button } from '@/components/ui'

type ErrorStatusCode = 400 | 401 | 403 | 404 | 500 | 'network'

type ErrorViewProps = {
  statusCode: ErrorStatusCode
  title?: string
  message?: string
  onRetry?: () => void
  onGoBack?: () => void
  supportHref?: string
}

const contentByStatus: Record<ErrorStatusCode, { title: string; message: string }> = {
  400: {
    title: '잘못된 요청입니다',
    message: '요청 내용을 다시 확인한 뒤 잠시 후 다시 시도해주세요.',
  },
  401: {
    title: '로그인이 필요합니다',
    message: '세션이 만료되었거나 로그인 정보가 없어 다시 인증이 필요합니다.',
  },
  403: {
    title: '접근 권한이 없습니다',
    message: '이 페이지나 데이터에 접근할 권한이 없습니다. 관리자에게 문의해주세요.',
  },
  404: {
    title: '찾을 수 없는 페이지입니다',
    message: '주소가 변경되었거나 삭제된 페이지일 수 있습니다. 다른 경로로 이동해보세요.',
  },
  500: {
    title: '서버 오류가 발생했습니다',
    message: '일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  network: {
    title: '네트워크 연결을 확인해주세요',
    message: '인터넷 연결이 불안정하거나 서버에 연결할 수 없습니다. 연결 상태를 확인한 뒤 다시 시도해주세요.',
  },
}

export function ErrorView({
  statusCode,
  title,
  message,
  onRetry,
  onGoBack,
  supportHref,
}: ErrorViewProps) {
  const copy = contentByStatus[statusCode]
  const badgeLabel = statusCode === 'network' ? 'NETWORK' : String(statusCode)
  const badgeVariant = statusCode === 500 ? 'error' : statusCode === 'network' ? 'default' : 'warning'

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[560px] flex-col items-center justify-center px-4 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(17,24,39,0.04)] text-[var(--text-primary)]">
        {statusCode === 'network' ? (
          <WifiOff className="h-7 w-7" aria-hidden="true" />
        ) : statusCode === 500 ? (
          <ServerCrash className="h-7 w-7" aria-hidden="true" />
        ) : (
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        )}
      </div>
      <Badge variant={badgeVariant} className="badge mt-5">
        {badgeLabel}
      </Badge>
      <h2 className="mt-4 text-[28px] font-semibold tracking-[-0.04em] text-text-primary">
        {title ?? copy.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        {message ?? copy.message}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry ? (
          <Button type="button" variant="primary" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
        {onGoBack ? (
          <Button type="button" variant="secondary" onClick={onGoBack}>
            Go back
          </Button>
        ) : null}
        {supportHref ? (
          <Button
            type="button"
            variant="ghost"
            className="underline decoration-transparent underline-offset-4 hover:decoration-current"
            onClick={() => window.location.assign(supportHref)}
          >
            Support
          </Button>
        ) : null}
      </div>
    </div>
  )
}
