'use client'

import React from 'react'

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  children: React.ReactNode
}

export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="w-full">
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-text-secondary">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-xs font-medium text-error-500">{error}</p>
      ) : null}
    </div>
  )
}
