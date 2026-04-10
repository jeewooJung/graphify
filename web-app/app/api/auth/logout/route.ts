import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('sessionId')

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    )
  }
}
