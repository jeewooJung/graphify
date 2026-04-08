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

export const permissionService = {
  async getPermissions() {
    return api.get<Permission[]>('/permissions')
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
