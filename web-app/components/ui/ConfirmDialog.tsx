'use client'

import React, { useEffect, useState } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) {
      setPending(false)
    }
  }, [open])

  const handleConfirm = async () => {
    if (pending) return

    setPending(true)
    try {
      await onConfirm()
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={pending ? () => undefined : onCancel}
      title={title}
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'danger' : 'primary'}
            onClick={() => void handleConfirm()}
            disabled={pending}
          >
            {pending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
            ) : null}
            {confirmLabel}
          </Button>
        </>
      )}
    >
      <p className="text-sm leading-6 text-text-secondary">{message}</p>
    </Modal>
  )
}
