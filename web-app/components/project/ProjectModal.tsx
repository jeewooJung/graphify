'use client'

import React, { useEffect, useState } from 'react'
import { Button, Field, Input, Modal } from '@/components/ui'
import type { Project } from '@/lib/api/project-service'

type ProjectFormValues = {
  name: string
  description: string
}

interface ProjectModalProps {
  open: boolean
  project?: Project
  onCancel: () => void
  onSubmit: (values: ProjectFormValues) => Promise<void>
}

export function ProjectModal({
  open,
  project,
  onCancel,
  onSubmit,
}: ProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [nameError, setNameError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) return

    setName(project?.name ?? '')
    setDescription(project?.description ?? '')
    setNameError('')
    setPending(false)
  }, [open, project])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      setNameError('Project name is required')
      return
    }

    setNameError('')
    setPending(true)

    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim(),
      })
    } finally {
      setPending(false)
    }
  }

  const title = project ? 'Edit project' : 'New project'
  const descriptionText = project
    ? 'Update the project name or description. Changes are saved to the live backend.'
    : 'Create a project with a clear name and short description for the team.'

  return (
    <Modal
      open={open}
      onClose={pending ? () => undefined : onCancel}
      title={title}
      description={descriptionText}
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="project-form" disabled={pending}>
            {pending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
            ) : null}
            {project ? 'Save changes' : 'Create project'}
          </Button>
        </>
      )}
    >
      <form id="project-form" className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={nameError}
          placeholder="Knowledge graph refresh"
          disabled={pending}
          autoFocus
        />

        <Field label="Description">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Summarize the goal, scope, or delivery theme."
            className="input-field min-h-[120px] resize-y px-3 py-3"
            disabled={pending}
          />
        </Field>
      </form>
    </Modal>
  )
}
