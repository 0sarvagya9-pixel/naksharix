import { NextRequest, NextResponse } from "next/server";

// This deprecated OAuth entrypoint used an unbound state query parameter.
// Keep the URL working as a navigation alias, but require users to begin
// Google login through NextAuth, which owns state, PKCE, and callback checks.
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/auth/login", request.url), 307);
}
