'use client'

type SkeletonProps = {
  width?: number | string
  height?: number | string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

const roundedClasses = {
  sm: 'rounded',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
}

export function Skeleton({
  width = '100%',
  height = 16,
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`animate-pulse bg-surface-hover ${roundedClasses[rounded]} ${className}`.trim()}
      style={{ width, height }}
    />
  )
}
