import React from 'react'
import ProjectContextNav from '@/components/project/ProjectContextNav'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  return (
    <>
      <ProjectContextNav projectId={projectId} />
      {children}
    </>
  )
}
