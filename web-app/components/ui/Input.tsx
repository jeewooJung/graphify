'use client'

import React from 'react'
import clsx from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}
        <input
          className={clsx(
            'input-field',
            error && 'error',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-xs font-medium text-error-500">{error}</p>
      )}
    </div>
  )
)

Input.displayName = 'Input'

export { Input }
