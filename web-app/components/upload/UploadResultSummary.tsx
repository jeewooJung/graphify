'use client'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { UploadResult } from '@/types/document'

type UploadResultSummaryProps = {
  result: UploadResult
  onRetryFailed: () => void
  onGoToDocuments: () => void
  onClose: () => void
}

export function UploadResultSummary({
  result,
  onRetryFailed,
  onGoToDocuments,
  onClose,
}: UploadResultSummaryProps) {
  const sections = [
    {
      title: `Succeeded (${result.succeeded.length})`,
      items: result.succeeded.map((item) => `${item.fileId} → ${item.documentId}`),
    },
    {
      title: `Failed (${result.failed.length})`,
      items: result.failed.map((item) => `${item.fileId}: ${item.reason}`),
    },
    {
      title: `Cancelled (${result.cancelled.length})`,
      items: result.cancelled.map((item) => item.fileId),
    },
  ].filter((section) => section.items.length > 0)

  return (
    <Card>
      <CardHeader className="mb-0">
        <CardTitle>업로드 결과</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => (
          <section key={section.title} className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {section.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        ))}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            type="button"
            disabled={result.failed.length === 0}
            onClick={onRetryFailed}
          >
            Retry failed
          </Button>
          <Button type="button" onClick={onGoToDocuments}>
            Go to documents
          </Button>
          <Button variant="ghost" type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
