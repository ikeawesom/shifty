import { withAuth } from '@kinde-oss/kinde-auth-nextjs/middleware'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  return withAuth(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/members/:path*',
    '/org/:path*',
    '/settings/:path*',
    '/shifts/:path*',
  ],
}
