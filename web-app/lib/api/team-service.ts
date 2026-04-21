import { api } from './client'
import {
  normalizeBackendUser,
  normalizeRole,
  type BackendUserPayload,
  type UserRole,
} from '@/lib/auth/users'
import { asRecord, resolveItems, toString } from '@/lib/api/service-utils'

type ServiceResult<T> = {
  data?: T
  error?: string
  status: number
}

export interface TeamMember {
  id: string
  membershipId?: string
  name: string
  email: string
  role: UserRole
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

type TeamMemberRecord = {
  membershipId?: string | number
  userId?: string | number
  id?: string | number
  displayName?: string
  username?: string
  email?: string
  role?: string
  joinedAt?: string
  status?: string
}

function mapMember(member: TeamMemberRecord): TeamMember {
  const normalizedUser = normalizeBackendUser(member)

  return {
    id: String(member.userId ?? member.id ?? normalizedUser.id),
    membershipId: toString(member.membershipId),
    name: member.displayName || member.username || normalizedUser.name,
    email: member.email ?? normalizedUser.email,
    role: normalizeRole(member.role),
    joinedDate: member.joinedAt
      ? new Date(member.joinedAt).toLocaleDateString('en-CA')
      : '-',
    status: member.status === 'inactive' ? 'inactive' : 'active',
  }
}

async function resolveUserByEmail(email: string): Promise<ServiceResult<{ id: string }>> {
  const response = await api.get<unknown>('/users')

  if (response.status === 403) {
    return {
      status: response.status,
      error: 'Adding members by email requires admin access',
    }
  }

  if (response.error || !response.data) {
    return {
      status: response.status,
      error: response.error || 'Failed to load users',
    }
  }

  const normalizedEmail = email.trim().toLowerCase()
  const match = resolveItems(response.data, ['users', 'items', 'data'])
    .map((item) => normalizeBackendUser(asRecord(item) as BackendUserPayload))
    .find((user) => user.email.toLowerCase() === normalizedEmail)

  if (!match) {
    return {
      status: 404,
      error: `No user found for ${email.trim()}`,
    }
  }

  return {
    status: response.status,
    data: { id: match.id },
  }
}

export const teamService = {
  async getTeam(teamId?: string) {
    const endpoint = teamId ? `/teams/${teamId}` : '/teams/current'
    return api.get<Team>(endpoint)
  },

  async resolveCurrentTeamId(): Promise<ServiceResult<string>> {
    const response = await api.get<unknown>('/teams/current')

    if (response.error || !response.data) {
      return {
        status: response.status,
        error: response.error || 'Failed to resolve current team',
      }
    }

    const teamId = toString(asRecord(response.data).id)
    if (!teamId) {
      return {
        status: response.status,
        error: 'Current team response did not include an id',
      }
    }

    return {
      status: response.status,
      data: teamId,
    }
  },

  async getMembers(teamId?: string) {
    const endpoint = teamId ? `/teams/${teamId}/members` : '/teams/current/members'
    const response = await api.get<unknown>(endpoint)

    if (response.error || !response.data) {
      return {
        ...response,
        data: [],
      }
    }

    return {
      ...response,
      data: resolveItems(response.data, ['members', 'items', 'data'])
        .map((member) => mapMember(asRecord(member) as TeamMemberRecord)) as TeamMember[],
    }
  },

  async addMember(teamId: string, email: string, role: string) {
    const userResponse = await resolveUserByEmail(email)

    if (userResponse.error || !userResponse.data) {
      return {
        status: userResponse.status,
        error: userResponse.error || 'Failed to resolve user',
      }
    }

    const userId = Number(userResponse.data.id)
    const addResponse = await api.post<unknown, { userId: number | string }>(
      `/teams/${teamId}/members`,
      { userId: Number.isFinite(userId) ? userId : userResponse.data.id }
    )

    if (addResponse.error || !addResponse.data) {
      return addResponse
    }

    const desiredRole = normalizeRole(role)
    if (desiredRole === 'editor') {
      return addResponse
    }

    let membershipId = toString(asRecord(addResponse.data).membershipId)
    if (!membershipId) {
      const membersResponse = await this.getMembers(teamId)
      membershipId = membersResponse.data
        ?.find((member) => member.id === userResponse.data?.id)
        ?.membershipId ?? ''
    }

    if (!membershipId) {
      return {
        status: addResponse.status,
        error: `Member added, but failed to set role to ${desiredRole}`,
      }
    }

    return this.updateMember(teamId, membershipId, desiredRole)
  },

  async updateMember(teamId: string, memberId: string, role: string) {
    return api.put(`/teams/${teamId}/members/${memberId}`, { role })
  },

  async removeMember(teamId: string, memberId: string) {
    return api.delete(`/teams/${teamId}/members/${memberId}`)
  },
}
