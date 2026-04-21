'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { ConfirmDialog, PageHeader } from '@/components/ui'
import { PermissionsList } from '@/components/permission/PermissionsList'
import { PermissionRoleModal } from '@/components/permission/PermissionRoleModal'
import { permissionService, type Permission, type PermissionRole } from '@/lib/api/permission-service'

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [permissionToEdit, setPermissionToEdit] = useState<Permission | null>(null)
  const [permissionToRevoke, setPermissionToRevoke] = useState<Permission | null>(null)

  const loadPermissions = useCallback(async () => {
    const response = await permissionService.getPermissions()

    if (response.error) {
      setPermissions([])
      setError(response.error)
    } else {
      setPermissions(response.data || [])
      setError('')
    }

    setLoading(false)
  }, [])

  const reloadPermissions = useCallback(async () => {
    setLoading(true)
    await loadPermissions()
  }, [loadPermissions])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPermissions()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadPermissions])

  const openEditModal = (permissionId: string) => {
    const permission = permissions.find((item) => item.id === permissionId)
    if (!permission) return

    setPermissionToEdit(permission)
  }

  const openRevokeDialog = (permissionId: string) => {
    const permission = permissions.find((item) => item.id === permissionId)
    if (!permission) return

    setPermissionToRevoke(permission)
  }

  const handleUpdatePermission = async (role: PermissionRole) => {
    if (!permissionToEdit) return

    const response = await permissionService.updatePermission(
      permissionToEdit.projectId,
      permissionToEdit.id,
      { role }
    )

    if (response.error) {
      setError(response.error)
      return
    }

    setError('')
    await reloadPermissions()
    setPermissionToEdit(null)
  }

  const handleRevokePermission = async () => {
    if (!permissionToRevoke) return

    const response = await permissionService.revokePermission(
      permissionToRevoke.projectId,
      permissionToRevoke.id
    )

    if (response.error) {
      setError(response.error)
      return
    }

    setError('')
    await reloadPermissions()
    setPermissionToRevoke(null)
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Access control"
        title="Permissions"
        description="Role-based access stays readable when the policy surface is compact. This view focuses on the permission itself before the action buttons."
        meta={
          <>
            <span className="app-chip">{permissions.length} active rules</span>
            <span className="app-chip">Graph, team, and project scope</span>
          </>
        }
      />

      <div className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-500">
            {error}
          </div>
        )}

        <div>
          <PermissionsList
            permissions={permissions}
            loading={loading}
            onEditPermission={openEditModal}
            onRevokePermission={openRevokeDialog}
          />
        </div>
      </div>

      <PermissionRoleModal
        open={permissionToEdit !== null}
        permission={permissionToEdit ?? undefined}
        onCancel={() => setPermissionToEdit(null)}
        onSubmit={handleUpdatePermission}
      />

      <ConfirmDialog
        open={permissionToRevoke !== null}
        title="Revoke permission"
        message={permissionToRevoke
          ? `Revoke ${permissionToRevoke.role} access for project ${permissionToRevoke.projectId}?`
          : ''}
        confirmLabel="Revoke access"
        destructive
        onConfirm={handleRevokePermission}
        onCancel={() => setPermissionToRevoke(null)}
      />
    </div>
  )
}
