import { api } from './client'

export interface Project {
  id: string
  name: string
  description: string
  owner: string
  memberCount: number
  graphCount: number
  createdDate: string
  lastModified: string
  status: 'active' | 'archived'
}

export const projectService = {
  async getProjects() {
    return api.get<Project[]>('/projects')
  },

  async getProject(projectId: string) {
    return api.get<Project>(`/projects/${projectId}`)
  },

  async createProject(data: Partial<Project>) {
    return api.post<Project>('/projects', data)
  },

  async updateProject(projectId: string, data: Partial<Project>) {
    return api.put<Project>(`/projects/${projectId}`, data)
  },

  async deleteProject(projectId: string) {
    return api.delete(`/projects/${projectId}`)
  },
}
