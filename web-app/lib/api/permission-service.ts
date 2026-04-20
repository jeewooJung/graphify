import { api } from './client'

export interface Permission {
  id: string
  role: string
  resource: string
  action: string
  description: string
  grantedTo: string[]
  createdDate: string
}

type PermissionRecord = {
  id: string | number
  role: string
  resource: string
  action: string
  description: string
  grantedTo?: string[]
  createdDate?: string
}

export const permissionService = {
  async getPermissions() {
    const response = await api.get<PermissionRecord[]>('/permissions')

    if (response.error || !response.data) {
      return {
        ...response,
        data: [],
      }
    }

    return {
      ...response,
      data: response.data.map((permission) => ({
        id: String(permission.id),
        role: permission.role,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
        grantedTo: Array.isArray(permission.grantedTo) ? permission.grantedTo : [],
        createdDate: permission.createdDate
          ? new Date(permission.createdDate).toLocaleDateString('en-CA')
          : '-',
      })) as Permission[],
    }
  },

  async getRolePermissions(role: string) {
    return api.get<Permission[]>(`/roles/${role}/permissions`)
  },

  async updatePermission(permissionId: string, data: Partial<Permission>) {
    return api.put<Permission>(`/permissions/${permissionId}`, data)
  },

  async grantPermission(roleId: string, permissionId: string) {
    return api.post(`/roles/${roleId}/permissions/${permissionId}`, {})
  },

  async revokePermission(roleId: string, permissionId: string) {
    return api.delete(`/roles/${roleId}/permissions/${permissionId}`)
  },
}
