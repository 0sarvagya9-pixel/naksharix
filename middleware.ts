import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/admin", "/astrologer", "/profile", "/my-readings", "/saved-reports"];
const authJsCookieNames = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token"
];

function getLegacyAuthCookieName() {
  return process.env.NODE_ENV === "production" ? "__Host-naksharix_session" : "naksharix_session";
}

function isProtectedPath(pathname: string) {
  if (pathname === "/astrologer/onboarding" || pathname.startsWith("/astrologer/onboarding/")) return false;
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function hasAuthCookie(request: NextRequest) {
  if (request.cookies.get(getLegacyAuthCookieName())?.value) return true;
  return authJsCookieNames.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!hasAuthCookie(request)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/astrologer/:path*", "/profile/:path*", "/my-readings/:path*", "/saved-reports/:path*"]
};
