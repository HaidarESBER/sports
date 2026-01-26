import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware for route protection.
 *
 * Note: We use a cookie-based check here because the Prisma SQLite adapter
 * uses Node.js-specific modules that don't work in Edge middleware.
 *
 * The actual session validation happens server-side in pages/actions.
 * This middleware provides a first line of defense by redirecting users
 * without a session cookie to the login page.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Auth.js session cookie (authjs.session-token or __Secure-authjs.session-token)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  const isLoggedIn = !!sessionToken

  // Protected routes that require authentication
  const protectedPatterns = [
    /^\/dashboard(\/|$)/,
    /^\/sessions\/new$/,
    /^\/programs\/new$/,
    /^\/profile(\/|$)/,
  ]

  const isProtectedRoute = protectedPatterns.some((pattern) =>
    pattern.test(pathname)
  )

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only run middleware on protected routes for efficiency
    "/dashboard/:path*",
    "/sessions/new",
    "/programs/new",
    "/profile/:path*",
  ],
}
