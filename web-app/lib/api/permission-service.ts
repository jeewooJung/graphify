import { api } from './client'
import { asRecord, resolveItems, toString } from '@/lib/api/service-utils'

export type PermissionRole = 'owner' | 'editor' | 'viewer'

export interface Permission {
  id: string
  projectId: string
  userId: string
  role: PermissionRole
  resource: string
  action: string
  description: string
  grantedTo: string[]
  createdDate: string
}

type PermissionRecord = {
  id?: string | number
  permissionId?: string | number
  projectId?: string | number
  userId?: string | number
  role?: string
  resource?: string
  action?: string
  description?: string
  grantedTo?: string[]
  createdDate?: string
}

function normalizePermissionRole(role: unknown): PermissionRole {
  const value = toString(role).toLowerCase()
  return value === 'owner' || value === 'editor' ? value : 'viewer'
}

export const permissionService = {
  async getPermissions() {
    const response = await api.get<unknown>('/permissions')

    if (response.error || !response.data) {
      return {
        ...response,
        data: [],
      }
    }

    return {
      ...response,
      data: resolveItems(response.data, ['permissions', 'items', 'data']).map((item) => {
        const permission = asRecord(item) as PermissionRecord

        return {
          id: toString(permission.id ?? permission.permissionId),
          projectId: toString(permission.projectId),
          userId: toString(permission.userId),
          role: normalizePermissionRole(permission.role),
          resource: toString(permission.resource),
          action: toString(permission.action),
          description: toString(permission.description),
          grantedTo: Array.isArray(permission.grantedTo) ? permission.grantedTo : [],
          createdDate: permission.createdDate
          ? new Date(permission.createdDate).toLocaleDateString('en-CA')
            : '-',
        }
      }) as Permission[],
    }
  },

  async updatePermission(
    projectId: string,
    permissionId: string,
    data: Pick<Permission, 'role'>
  ) {
    return api.put<Permission>(`/projects/${projectId}/permissions/${permissionId}`, data)
  },

  async grantPermission(
    projectId: string,
    data: { userId: string; role: PermissionRole }
  ) {
    const userId = Number(data.userId)

    return api.post<Permission, { userId: number | string; role: PermissionRole }>(
      `/projects/${projectId}/permissions`,
      {
        userId: Number.isFinite(userId) ? userId : data.userId,
        role: data.role,
      }
    )
  },

  async revokePermission(projectId: string, permissionId: string) {
    return api.delete(`/projects/${projectId}/permissions/${permissionId}`)
  },
}
