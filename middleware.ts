import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/admin", "/astrologer"];

function getAuthCookieName() {
  return process.env.NODE_ENV === "production" ? "__Host-naksharix_session" : "naksharix_session";
}

function isProtectedPath(pathname: string) {
  if (pathname === "/astrologer/onboarding" || pathname.startsWith("/astrologer/onboarding/")) return false;
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getAuthCookieName())?.value;

  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/astrologer/:path*"]
};
