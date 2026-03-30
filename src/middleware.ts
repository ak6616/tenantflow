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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    "/dashboard/:path*",
    "/leads/:path*",
    "/pipeline/:path*",
    "/contacts/:path*",
    "/reports/:path*",
    "/billing/:path*",
    "/settings/:path*",
  ],
};
