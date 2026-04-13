'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui'

type DocumentSearchInputProps = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function DocumentSearchInput({
  value,
  onChange,
  placeholder = 'Search documents',
}: DocumentSearchInputProps) {
  const [buffer, setBuffer] = useState(value)

  useEffect(() => {
    setBuffer(value)
  }, [value])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (buffer !== value) onChange(buffer)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [buffer, onChange, value])

  return (
    <Input
      value={buffer}
      icon={<Search size={15} />}
      placeholder={placeholder}
      onChange={(event) => setBuffer(event.target.value)}
      className="h-10 min-w-[220px]"
    />
  )
}
