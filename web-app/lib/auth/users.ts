export type UserRole = 'admin' | 'editor' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  username?: string
}

export interface BackendUserPayload {
  id?: string | number
  userId?: string | number
  username?: string
  displayName?: string
  email?: string
  role?: string
}

const ROLE_MAP: Record<string, UserRole> = {
  ADMIN: 'admin',
  TEAM_LEAD: 'admin',
  MEMBER: 'editor',
  VIEWER: 'viewer',
  admin: 'admin',
  owner: 'admin',
  editor: 'editor',
  viewer: 'viewer',
}

export function normalizeRole(role?: string): UserRole {
  return ROLE_MAP[role ?? ''] ?? 'viewer'
}

export function normalizeBackendUser(payload: BackendUserPayload): User {
  const resolvedId = payload.id ?? payload.userId ?? ''
  const resolvedEmail = payload.email ?? payload.username ?? ''
  const resolvedUsername = payload.username ?? resolvedEmail
  const resolvedName = payload.displayName || resolvedUsername || resolvedEmail

  return {
    id: String(resolvedId),
    email: resolvedEmail,
    name: resolvedName,
    role: normalizeRole(payload.role),
    username: resolvedUsername,
  }
}
