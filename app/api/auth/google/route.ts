import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return fail("Google OAuth is not configured", 503);
  }

  const callbackUrl = new URL("/api/auth/google/callback", env.NEXTAUTH_URL);
  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", callbackUrl.toString());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", next);
  return NextResponse.redirect(url);
}
