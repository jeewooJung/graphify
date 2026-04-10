import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_API_URL } from '@/lib/api/backend-url'
import { AUTH_TOKEN_COOKIE } from '@/lib/auth/session'
import { normalizeBackendUser } from '@/lib/auth/users'

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json()
    const loginId = username || email

    if (!loginId || !password) {
      return NextResponse.json(
        { message: 'Email/username and password required' },
        { status: 400 }
      )
    }

    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: loginId,
        password,
      }),
      cache: 'no-store',
    })

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok || !payload?.token) {
      return NextResponse.json(
        { message: payload?.message || 'Login failed' },
        { status: backendResponse.status || 500 }
      )
    }

    const user = normalizeBackendUser(payload)
    const cookieStore = await cookies()
    cookieStore.set(AUTH_TOKEN_COOKIE, payload.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Number(payload.expiresIn ?? 3600),
      path: '/',
    })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
