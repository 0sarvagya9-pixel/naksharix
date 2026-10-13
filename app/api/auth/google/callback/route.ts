import { NextResponse } from "next/server";

// Fail closed: legacy callback accepted authorization codes without verifying
// a session-bound state and linked accounts by email. The supported Google
// callback is exclusively handled by NextAuth at /api/auth/callback/google.
export async function GET() {
  return NextResponse.json(
    { error: "Legacy Google OAuth callback is disabled. Sign in via /auth/login." },
    { status: 410, headers: { "Cache-Control": "no-store" } }
  );
}
