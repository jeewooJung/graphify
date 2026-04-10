'use client'

import React from 'react'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-[12px]',
  md: 'h-9 px-3.5 text-[13px]',
  lg: 'h-10 px-4 text-sm',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', children, ...props },
    ref
  ) => (
    <button
      className={clsx(
        buttonVariants[variant],
        buttonSizes[size],
        'shrink-0',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'

export { Button }
