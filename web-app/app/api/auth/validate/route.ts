import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { BACKEND_API_URL } from '@/lib/api/backend-url'
import { AUTH_TOKEN_COOKIE } from '@/lib/auth/session'
import { normalizeBackendUser } from '@/lib/auth/users'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get(AUTH_TOKEN_COOKIE)?.value

    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    })

    if (!backendResponse.ok) {
      cookieStore.delete(AUTH_TOKEN_COOKIE)
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = await backendResponse.json()
    return NextResponse.json({ user: normalizeBackendUser(payload) })
  } catch {
    return NextResponse.json(
      { message: 'Validation failed' },
      { status: 500 }
    )
  }
}
