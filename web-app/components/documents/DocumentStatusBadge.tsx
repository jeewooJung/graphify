import { AlertTriangle, CheckCircle2, CircleDashed, Clock, FileSearch, Layers } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { DocumentStatus } from '@/types/document'

type DocumentStatusBadgeProps = {
  status: DocumentStatus
  progressPct?: number
}

const STATUS_META: Record<DocumentStatus, {
  icon: typeof CircleDashed
  label: string
  title: string
  variant: 'default' | 'primary' | 'warning' | 'success' | 'error'
}> = {
  UPLOADED: {
    icon: CircleDashed,
    label: 'Uploaded',
    title: 'The file was uploaded and is waiting for processing to begin.',
    variant: 'default',
  },
  QUEUED: {
    icon: Clock,
    label: 'Queued',
    title: 'The document is queued and waiting for a worker.',
    variant: 'primary',
  },
  PARSING: {
    icon: FileSearch,
    label: 'Parsing',
    title: 'The document content is being parsed and extracted.',
    variant: 'warning',
  },
  INDEXING: {
    icon: Layers,
    label: 'Indexing',
    title: 'The parsed content is being chunked and indexed.',
    variant: 'warning',
  },
  READY: {
    icon: CheckCircle2,
    label: 'Ready',
    title: 'The document is ready for search and chat.',
    variant: 'success',
  },
  FAILED: {
    icon: AlertTriangle,
    label: 'Failed',
    title: 'Processing failed. Review the document status and retry if needed.',
    variant: 'error',
  },
}

export function DocumentStatusBadge({ status, progressPct }: DocumentStatusBadgeProps) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  const shouldShowProgress = typeof progressPct === 'number' && (status === 'PARSING' || status === 'INDEXING')
  const label = shouldShowProgress ? `${meta.label} ${progressPct}%` : meta.label

  return (
    <Badge variant={meta.variant} title={meta.title} className="badge">
      <Icon size={12} aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  )
}
