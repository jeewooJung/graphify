'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

interface ProjectContextNavProps {
  projectId: string
}

export default function ProjectContextNav({ projectId }: ProjectContextNavProps) {
  const pathname = usePathname()
  const tabs = [
    { label: 'Overview', href: ROUTES.project(projectId) },
    { label: 'Documents', href: ROUTES.projectDocuments(projectId) },
  ]

  return (
    <div className="border-b border-border bg-transparent">
      <div className="mx-auto flex w-full max-w-[1520px] gap-2 px-[18px] pt-4 md:px-7 md:pt-5">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              'inline-flex border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              pathname === tab.href
                ? 'border-primary-500 text-primary-700'
                : 'border-transparent text-text-tertiary hover:text-text-primary'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
