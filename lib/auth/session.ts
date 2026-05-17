import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/auth/token";
import { signAuthToken } from "@/lib/auth/token";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(user: AuthUser, request?: Request) {
  const token = await signAuthToken(user);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken: randomUUID(),
      tokenHash: hashToken(token),
      ipAddress: request?.headers.get("x-forwarded-for") ?? request?.headers.get("x-real-ip"),
      userAgent: request?.headers.get("user-agent"),
      expires,
      expiresAt: expires
    }
  });
  return token;
}

export async function revokeSession(token?: string) {
  if (!token) return;
  await prisma.session.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

