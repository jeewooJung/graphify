import { api } from './client'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  joinedDate: string
  status: 'active' | 'inactive'
}

export interface Team {
  id: string
  name: string
  description: string
  memberCount: number
  members: TeamMember[]
  createdDate: string
}

export const teamService = {
  async getTeam(teamId?: string) {
    const endpoint = teamId ? `/teams/${teamId}` : '/teams/current'
    return api.get<Team>(endpoint)
  },

  async getMembers(teamId?: string) {
    const endpoint = teamId ? `/teams/${teamId}/members` : '/teams/current/members'
    return api.get<TeamMember[]>(endpoint)
  },

  async addMember(teamId: string, email: string, role: string) {
    return api.post(`/teams/${teamId}/members`, { email, role })
  },

  async updateMember(teamId: string, memberId: string, role: string) {
    return api.put(`/teams/${teamId}/members/${memberId}`, { role })
  },

  async removeMember(teamId: string, memberId: string) {
    return api.delete(`/teams/${teamId}/members/${memberId}`)
  },
}
