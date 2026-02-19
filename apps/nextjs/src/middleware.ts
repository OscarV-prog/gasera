import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { url, nextUrl, cookies } = request;

  // Check for both common cookie names just in case
  const sessionCookie =
    cookies.get("better-auth.session_token") ||
    cookies.get("better-auth.session-token");

  // Public routes that should be reachable without an auth session.
  // NOTE: The app currently does not implement a /login page; the landing page
  // ("/") contains the sign-in UI.
  const isPublicPage = nextUrl.pathname === "/";

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/signup");

  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isStaticRoute =
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/static") ||
    nextUrl.pathname.includes("favicon");

  // Allow static assets and API routes (handled by tRPC/API)
  if (isStaticRoute || isApiRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!sessionCookie && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/", url));
  }

  // Redirect authenticated users away from auth pages AND the public landing page (login)
  if (sessionCookie && (isAuthPage || isPublicPage)) {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  // For authenticated users, validate session based on cookie presence
  if (sessionCookie) {
    // Optimistic check: If the cookie is present, let them through.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
export default middleware;
