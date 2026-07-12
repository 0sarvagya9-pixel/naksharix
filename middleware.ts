import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/admin", "/astrologer", "/profile", "/my-readings", "/saved-reports"];
const authJsCookieNames = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token"
];
const csrfCookieName = "naksharix_csrf";
const csrfHeaderName = "x-csrf-token";
const csrfExemptApiPrefixes = [
  "/api/payments/razorpay/webhook",
  "/api/numerology",
  "/api/auth/callback/",
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/session",
  "/api/auth/csrf",
  "/api/auth/providers",
  "/api/auth/error",
  "/api/auth/verify-request"
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

function requiresCsrf(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) return false;
  if (["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) return false;
  return !csrfExemptApiPrefixes.some((prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(prefix));
}

function hasValidCsrf(request: NextRequest) {
  const cookieToken = request.cookies.get(csrfCookieName)?.value ?? "";
  const headerToken = request.headers.get(csrfHeaderName) ?? "";
  if (!cookieToken || !headerToken || cookieToken.length !== headerToken.length) return false;
  let mismatch = 0;
  for (let index = 0; index < cookieToken.length; index += 1) {
    mismatch |= cookieToken.charCodeAt(index) ^ headerToken.charCodeAt(index);
  }
  return mismatch === 0;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (requiresCsrf(request) && !hasValidCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

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
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/astrologer/:path*",
    "/profile/:path*",
    "/my-readings/:path*",
    "/saved-reports/:path*"
  ]
};
