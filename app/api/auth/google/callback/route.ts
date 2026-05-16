import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { setAuthCookie } from "@/lib/auth/jwt";
import { createSession } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";

type GoogleProfile = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
};

export async function GET(request: NextRequest) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return fail("Google OAuth is not configured", 503);
  }

  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("state") ?? "/dashboard";
  if (!code) return fail("Missing Google OAuth code", 400);

  const redirectUri = new URL("/api/auth/google/callback", env.NEXTAUTH_URL).toString();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!tokenResponse.ok) return fail("Google token exchange failed", 401);
  const tokens = await tokenResponse.json() as { access_token?: string };
  if (!tokens.access_token) return fail("Google access token missing", 401);

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });
  if (!profileResponse.ok) return fail("Google profile lookup failed", 401);
  const profile = await profileResponse.json() as GoogleProfile;

  const user = await prisma.user.upsert({
    where: { email: profile.email },
    update: {
      googleId: profile.sub,
      name: profile.name ?? profile.email.split("@")[0],
      avatarUrl: profile.picture,
      emailVerifiedAt: profile.email_verified ? new Date() : undefined
    },
    create: {
      email: profile.email,
      googleId: profile.sub,
      name: profile.name ?? profile.email.split("@")[0],
      avatarUrl: profile.picture,
      emailVerifiedAt: profile.email_verified ? new Date() : undefined,
      referralCode: `${slugify(profile.name ?? profile.email).slice(0, 12)}-${Math.random().toString(36).slice(2, 7)}`
    }
  });

  const token = await createSession({ id: user.id, email: user.email, name: user.name, role: user.role }, request);
  await setAuthCookie(token);
  return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/dashboard", env.NEXTAUTH_URL));
}
