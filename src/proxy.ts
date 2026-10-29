import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "admin_session";

/**
 * Optimistic gate only: bounces requests that carry no session cookie at all.
 * It does NOT validate sessions — every admin page, Server Action and API route
 * re-checks authorisation against the database on the server.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasCookie = request.cookies.has(SESSION_COOKIE);

  if (pathname.startsWith("/api/admin")) {
    if (!hasCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.next();
  }

  if (pathname !== "/admin/login" && !hasCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const response = NextResponse.next();
  // Admin pages are never indexed or framed.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
