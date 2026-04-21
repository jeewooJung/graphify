'use client'

import React from 'react'
import { Badge } from '@/components/ui'
import type { Permission } from '@/lib/api/permission-service'
import { Edit, Trash2 } from 'lucide-react'

interface PermissionsListProps {
  permissions: Permission[]
  loading?: boolean
  onEditPermission?: (permissionId: string) => void
  onRevokePermission?: (permissionId: string) => void
}

const actionColors: Record<string, string> = {
  create: 'success',
  read: 'primary',
  update: 'warning',
  delete: 'error',
}

export function PermissionsList({
  permissions = [],
  loading = false,
  onEditPermission,
  onRevokePermission,
}: PermissionsListProps) {
  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading permissions...</p>
      </div>
    )
  }

  if (permissions.length === 0) {
    return (
      <div className="empty-state">
        <p>No permissions configured</p>
      </div>
    )
  }

  return (
    <div className="app-table-shell overflow-x-auto">
      <table className="app-table">
        <thead>
          <tr>
            <th className="text-left">Role</th>
            <th className="text-left">Resource</th>
            <th className="text-left">Action</th>
            <th className="text-left">Description</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map(permission => (
            <tr key={permission.id}>
              <td className="font-semibold text-text-primary">
                {permission.role}
              </td>
              <td>{permission.resource}</td>
              <td>
                <Badge
                  variant={(actionColors[permission.action] || 'primary') as 'primary' | 'success' | 'warning' | 'error'}
                >
                  {permission.action}
                </Badge>
              </td>
              <td>{permission.description}</td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEditPermission?.(permission.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white/82 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRevokePermission?.(permission.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white/82 text-error-500 transition-colors hover:bg-error-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
