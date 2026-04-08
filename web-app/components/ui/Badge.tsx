'use client'

import React from 'react'
import clsx from 'clsx'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'default'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: React.ReactNode
}

const badgeVariants: Record<BadgeVariant, string> = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  default: 'badge-default',
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <span
      className={clsx(
        badgeVariants[variant],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  )
)

Badge.displayName = 'Badge'

export { Badge }
