import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Mock user database
const USERS = [
  {
    id: '1',
    email: 'demo@graphify.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'admin' as const,
  },
]

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Find user by session ID
    const user = USERS.find(u => u.id === sessionId)

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      )
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    return NextResponse.json(
      { message: 'Validation failed' },
      { status: 500 }
    )
  }
}
