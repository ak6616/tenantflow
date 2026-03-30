import { NextRequest, NextResponse } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/leads",
  "/pipeline",
  "/contacts",
  "/reports",
  "/billing",
  "/settings",
];

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const ipRequests = new Map<string, { count: number; resetAt: number }>();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Demo rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const now = Date.now();
    const entry = ipRequests.get(ip);

    if (!entry || now > entry.resetAt) {
      ipRequests.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    } else {
      entry.count++;
      if (entry.count > RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "Demo rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }
  }

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("tf_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/leads/:path*",
    "/pipeline/:path*",
    "/contacts/:path*",
    "/reports/:path*",
    "/billing/:path*",
    "/settings/:path*",
  ],
};