'use client'

import React from 'react'
import clsx from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      className={clsx(
        'card',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
)

Card.displayName = 'Card'

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      className={clsx('border-b border-border pb-4 mb-4', className)}
      ref={ref}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      className={clsx('text-lg font-semibold text-text-primary', className)}
      ref={ref}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      className={clsx('text-sm text-text-secondary', className)}
      ref={ref}
      {...props}
    />
  )
)

CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
