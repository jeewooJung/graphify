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
    const response = await api.get<any[]>('/projects')

    if (response.error || !response.data) {
      return {
        ...response,
        data: [],
      }
    }

    return {
      ...response,
      data: response.data.map((project) => ({
        id: String(project.id),
        name: project.name,
        description: project.description || '',
        owner: project.owner || 'Unassigned',
        memberCount: Number(project.memberCount ?? 0),
        graphCount: Number(project.graphCount ?? 0),
        createdDate: project.createdDate
          ? new Date(project.createdDate).toLocaleDateString('en-CA')
          : '-',
        lastModified: project.lastModified
          ? new Date(project.lastModified).toLocaleDateString('en-CA')
          : '-',
        status: project.status === 'archived' ? 'archived' : 'active',
      })) as Project[],
    }
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
