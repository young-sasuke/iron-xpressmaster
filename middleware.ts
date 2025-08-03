import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Only handle auth callback
  if (req.nextUrl.pathname === '/auth/callback') {
    // Let the callback page handle the auth flow
    console.log('Auth callback middleware - passing through to page')
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/auth/callback',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
