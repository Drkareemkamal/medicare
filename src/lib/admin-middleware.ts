import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

export async function adminMiddleware(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const user = await getUserFromToken(token)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}
