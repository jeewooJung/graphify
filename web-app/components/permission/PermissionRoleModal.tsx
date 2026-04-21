'use client'

import React, { useEffect, useState } from 'react'
import { Button, Field, Modal } from '@/components/ui'
import type { Permission, PermissionRole } from '@/lib/api/permission-service'

const ROLE_OPTIONS: Array<{ value: PermissionRole; label: string }> = [
  { value: 'owner', label: 'Owner' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
]

interface PermissionRoleModalProps {
  open: boolean
  permission?: Permission
  onCancel: () => void
  onSubmit: (role: PermissionRole) => Promise<void>
}

export function PermissionRoleModal({
  open,
  permission,
  onCancel,
  onSubmit,
}: PermissionRoleModalProps) {
  const [role, setRole] = useState<PermissionRole>('viewer')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) return

    setRole(permission?.role ?? 'viewer')
    setPending(false)
  }, [open, permission])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)

    try {
      await onSubmit(role)
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={pending ? () => undefined : onCancel}
      title="Edit permission"
      description="Adjust the access level for this project permission."
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="permission-role-form" disabled={pending}>
            {pending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
            ) : null}
            Save changes
          </Button>
        </>
      )}
    >
      <form
        id="permission-role-form"
        className="space-y-4"
        onSubmit={(event) => void handleSubmit(event)}
      >
        {permission ? (
          <div className="flex flex-wrap gap-2">
            <span className="app-chip">Resource: {permission.resource}</span>
            <span className="app-chip">Action: {permission.action}</span>
            <span className="app-chip">Project {permission.projectId}</span>
          </div>
        ) : null}

        <Field label="Role">
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as PermissionRole)}
            className="input-field"
            disabled={pending}
            autoFocus
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
