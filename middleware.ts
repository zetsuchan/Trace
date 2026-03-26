import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "trace-session";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/api/auth"];
const PUBLIC_PREFIXES = ["/docs", "/api/auth"];

// Routes that require provider role (checked server-side in API handlers)
// Middleware only checks for a session cookie — role enforcement is in the API/page layer
const PROVIDER_PREFIXES = ["/provider"];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // Public routes — always accessible
  if (isPublicRoute(pathname)) {
    // If logged in and visiting /login, redirect to appropriate home
    if (pathname === "/login" && hasSession) {
      return NextResponse.redirect(new URL("/trace/new", request.url));
    }
    return NextResponse.next();
  }

  // All other routes require a session cookie
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)",
  ],
};
