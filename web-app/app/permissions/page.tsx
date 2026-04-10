'use client'

import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui'
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

      <div>
        <div>
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
