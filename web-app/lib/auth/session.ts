import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { BACKEND_API_URL } from '@/lib/api/backend-url'
import { normalizeBackendUser, type User } from './users'

const AUTH_TOKEN_COOKIE = 'authToken'

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null
}

export async function getSessionUser(): Promise<User | null> {
  const authToken = await getSessionToken()

  if (!authToken) {
    return null
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    return normalizeBackendUser(payload)
  } catch {
    return null
  }
}

export async function requireSessionUser(redirectTo = '/auth/login'): Promise<User> {
  const user = await getSessionUser()

  if (!user) {
    redirect(redirectTo)
  }

  return user
}

export { AUTH_TOKEN_COOKIE }
