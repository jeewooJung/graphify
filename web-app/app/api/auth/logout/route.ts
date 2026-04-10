import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { BACKEND_API_URL } from '@/lib/api/backend-url'
import { AUTH_TOKEN_COOKIE } from '@/lib/auth/session'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get(AUTH_TOKEN_COOKIE)?.value

    if (authToken) {
      await fetch(`${BACKEND_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        cache: 'no-store',
      }).catch(() => null)
    }

    cookieStore.delete(AUTH_TOKEN_COOKIE)
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch {
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    )
  }
}
