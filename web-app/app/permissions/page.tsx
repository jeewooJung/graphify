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

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true)
      const response = await permissionService.getPermissions()

      if (response.error) {
        setPermissions([])
        setError(response.error)
      } else {
        setPermissions(response.data || [])
        setError('')
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
            onEditPermission={(id) => console.log('Edit permission', id)}
            onRevokePermission={(id) => console.log('Revoke permission', id)}
          />
        </div>
      </div>
    </div>
  )
}
