'use client'

import { Button } from '@/components/ui'
import type { SuggestedQuestion } from '@/types/chat'

type SuggestedFollowUpsProps = {
  items: SuggestedQuestion[]
  onSelect: (text: string) => void
  isLoading?: boolean
}

export function SuggestedFollowUps({ items, onSelect, isLoading = false }: SuggestedFollowUpsProps) {
  if (!isLoading && items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {isLoading
        ? Array.from({ length: 3 }).map((_, index) => (
            <span
              key={index}
              className="h-8 w-32 animate-pulse rounded-full border border-border bg-surface-hover"
            />
          ))
        : items.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full"
              onClick={() => onSelect(item.text)}
            >
              {item.text}
            </Button>
          ))}
    </div>
  )
}
