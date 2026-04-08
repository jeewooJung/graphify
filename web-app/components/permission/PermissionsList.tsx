'use client'

import React from 'react'
import { Badge } from '@/components/ui'
import { Edit, Trash2 } from 'lucide-react'

interface Permission {
  id: string
  role: string
  resource: string
  action: string
  description: string
  grantedTo: string[]
  createdDate: string
}

interface PermissionsListProps {
  permissions: Permission[]
  loading?: boolean
  onEditPermission?: (permissionId: string) => void
  onRevokePermission?: (permissionId: string) => void
}

const actionColors: Record<string, string> = {
  create: '#10b981',
  read: '#3366cc',
  update: '#f59e0b',
  delete: '#ef4444',
}

export function PermissionsList({
  permissions = [],
  loading = false,
  onEditPermission,
  onRevokePermission,
}: PermissionsListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-text-tertiary)' }}>Loading permissions...</p>
      </div>
    )
  }

  if (permissions.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--color-text-tertiary)' }}>No permissions configured</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-left px-4 py-3 font-semibold text-sm">Role</th>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-left px-4 py-3 font-semibold text-sm">Resource</th>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-left px-4 py-3 font-semibold text-sm">Action</th>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-left px-4 py-3 font-semibold text-sm">Description</th>
            <th style={{ color: 'var(--color-text-primary)' }} className="text-center px-4 py-3 font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map(permission => (
            <tr key={permission.id} style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
              <td style={{ color: 'var(--color-text-primary)' }} className="px-4 py-3 text-sm font-medium">
                {permission.role}
              </td>
              <td style={{ color: 'var(--color-text-secondary)' }} className="px-4 py-3 text-sm">
                {permission.resource}
              </td>
              <td className="px-4 py-3 text-sm">
                <Badge
                  variant="primary"
                  style={{ backgroundColor: actionColors[permission.action] || '#3366cc' }}
                >
                  {permission.action}
                </Badge>
              </td>
              <td style={{ color: 'var(--color-text-secondary)' }} className="px-4 py-3 text-sm">
                {permission.description}
              </td>
              <td className="px-4 py-3 text-sm text-center flex gap-2 justify-center">
                <button
                  onClick={() => onEditPermission?.(permission.id)}
                  className="p-1 hover:bg-surface rounded transition-colors"
                >
                  <Edit size={16} style={{ color: 'var(--color-text-secondary)' }} />
                </button>
                <button
                  onClick={() => onRevokePermission?.(permission.id)}
                  className="p-1 hover:bg-surface rounded transition-colors"
                >
                  <Trash2 size={16} style={{ color: 'var(--color-error)' }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
