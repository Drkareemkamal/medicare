import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile
    })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
