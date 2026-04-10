import { api } from './client'
import { normalizeRole } from '@/lib/auth/users'

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
    const response = await api.get<any[]>(endpoint)

    if (response.error || !response.data) {
      return {
        ...response,
        data: [],
      }
    }

    return {
      ...response,
      data: response.data.map((member) => ({
        id: String(member.userId ?? member.id),
        name: member.displayName || member.username || member.email,
        email: member.email,
        role: normalizeRole(member.role),
        joinedDate: member.joinedAt
          ? new Date(member.joinedAt).toLocaleDateString('en-CA')
          : '-',
        status: member.status === 'inactive' ? 'inactive' : 'active',
      })) as TeamMember[],
    }
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
