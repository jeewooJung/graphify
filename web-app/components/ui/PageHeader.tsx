'use client'

import React from 'react'
import clsx from 'clsx'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  meta?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={clsx('page-header', className)}>
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
        {meta && <div className="page-meta">{meta}</div>}
      </div>

      {actions && (
        <div className="page-actions">
          {actions}
        </div>
      )}
    </div>
  )
}
