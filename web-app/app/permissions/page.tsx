'use client'

import React, { useEffect, useState } from 'react'
import { PermissionsList } from '@/components/permission/PermissionsList'
import { permissionService } from '@/lib/api/permission-service'

interface Permission {
  id: string
  role: string
  resource: string
  action: string
  description: string
  grantedTo: string[]
  createdDate: string
}

const MOCK_PERMISSIONS: Permission[] = [
  {
    id: '1',
    role: 'admin',
    resource: 'graphs',
    action: 'create',
    description: 'Create new graphs',
    grantedTo: ['admin'],
    createdDate: '2024-01-01',
  },
  {
    id: '2',
    role: 'editor',
    resource: 'graphs',
    action: 'update',
    description: 'Update graphs',
    grantedTo: ['admin', 'editor'],
    createdDate: '2024-01-01',
  },
  {
    id: '3',
    role: 'viewer',
    resource: 'graphs',
    action: 'read',
    description: 'View graphs',
    grantedTo: ['admin', 'editor', 'viewer'],
    createdDate: '2024-01-01',
  },
  {
    id: '4',
    role: 'admin',
    resource: 'team',
    action: 'delete',
    description: 'Manage team members',
    grantedTo: ['admin'],
    createdDate: '2024-01-01',
  },
]

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>(MOCK_PERMISSIONS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true)
      const response = await permissionService.getPermissions()

      if (response.error) {
        setPermissions(MOCK_PERMISSIONS)
      } else {
        setPermissions(response.data || MOCK_PERMISSIONS)
      }
      setLoading(false)
    }

    fetchPermissions()
  }, [])

  return (
    <div style={{ backgroundColor: '#ffffff' }} className="min-h-screen">
      {/* Header */}
      <div style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }} className="px-8 py-6">
        <h1 style={{ color: 'var(--color-text-primary)' }} className="text-3xl font-semibold mb-2">
          Permissions
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Manage role-based access control
        </p>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="bg-white border rounded-lg" style={{ borderColor: 'var(--color-border)' }}>
          <PermissionsList
            permissions={permissions}
            loading={loading}
            onEditPermission={(id) => console.log('Edit permission', id)}
            onRevokePermission={(id) => console.log('Revoke permission', id)}
          />
        </div>
      </div>
    </div>
  )
}
