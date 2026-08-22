import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

/**
 * Fast-path only: redirects anonymous requests away from /admin before a
 * page even renders. The proxy runs on the Edge runtime and can't safely
 * reach Postgres, so it only checks that a session cookie is present — it
 * cannot verify the cookie or the user's role. The authoritative check is
 * `requireRole()` in app/(admin)/layout.tsx, which does query the database
 * on every request. /author is intentionally NOT handled here: it shares
 * its URL space with the public author-profile route
 * (app/(public)/author/[slug]), which this proxy can't distinguish
 * from the dashboard routes without duplicating Next's own route matching.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSession) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
