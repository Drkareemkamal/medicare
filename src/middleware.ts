import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      const token = request.cookies.get('token')?.value

      if (!token) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      const user = await getUserFromToken(token)

      if (!user || user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      const token = request.cookies.get('token')?.value

      if (!token) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      const user = await getUserFromToken(token)

      if (!user) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Redirect admin to admin panel
      if (user.role === 'ADMIN' && request.nextUrl.pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
