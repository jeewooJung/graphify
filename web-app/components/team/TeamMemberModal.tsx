'use client'

import React, { useEffect, useState } from 'react'
import { Button, Field, Input, Modal } from '@/components/ui'
import type { TeamMember } from '@/lib/api/team-service'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
] as const

type TeamMemberFormValues = {
  email: string
  role: TeamMember['role']
}

interface TeamMemberModalProps {
  open: boolean
  member?: TeamMember
  onCancel: () => void
  onSubmit: (values: TeamMemberFormValues) => Promise<void>
}

export function TeamMemberModal({
  open,
  member,
  onCancel,
  onSubmit,
}: TeamMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamMember['role']>('editor')
  const [emailError, setEmailError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) return

    setEmail(member?.email ?? '')
    setRole(member?.role ?? 'editor')
    setEmailError('')
    setPending(false)
  }, [member, open])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedEmail = email.trim()

    if (!member && !trimmedEmail) {
      setEmailError('Email is required')
      return
    }

    setEmailError('')
    setPending(true)

    try {
      await onSubmit({
        email: trimmedEmail,
        role,
      })
    } finally {
      setPending(false)
    }
  }

  const title = member ? 'Edit team member' : 'Add member'
  const description = member
    ? 'Update the member role for the current team.'
    : 'Invite a user by email and assign their initial role.'

  return (
    <Modal
      open={open}
      onClose={pending ? () => undefined : onCancel}
      title={title}
      description={description}
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="team-member-form" disabled={pending}>
            {pending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
            ) : null}
            {member ? 'Save role' : 'Add member'}
          </Button>
        </>
      )}
    >
      <form
        id="team-member-form"
        className="space-y-4"
        onSubmit={(event) => void handleSubmit(event)}
      >
        {member ? (
          <div className="space-y-2 rounded-2xl border border-border bg-surface-hover px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              Member
            </div>
            <div className="text-sm font-semibold text-text-primary">{member.name}</div>
            <div className="text-sm text-text-secondary">{member.email}</div>
          </div>
        ) : (
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailError}
            placeholder="teammate@company.com"
            disabled={pending}
            autoFocus
          />
        )}

        <Field label="Role">
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as TeamMember['role'])}
            className="input-field"
            disabled={pending}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </form>
    </Modal>
  )
}
