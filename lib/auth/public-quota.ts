import "server-only";
import { createHmac } from "node:crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

// These operations can lead to password guesses, spam and OTP delivery.
// Only keyed digests are stored in the shared AuditLog, not IPs or email.
export type AuthQuotaScope =
  | "signup-ip" | "login-ip"
  | "otp-request-ip" | "otp-request-destination"
  | "otp-verify-ip" | "otp-verify-destination";

export function trustedPublicClientIp(request: Request): string {
  // Prefer Vercel's trusted forwarded copy in production. The normal proxy
  // header remains useful for local isolated tests and non-Vercel hosting.
  const header = (
    (process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") : null)
    || request.headers.get("x-forwarded-for")
    || request.headers.get("x-real-ip")
    || "unknown-client"
  );
  return header.split(",")[0].trim().slice(0,128) || "unknown-client";
}

export async function claimPublicAuthQuota(input: {
  scope: AuthQuotaScope;
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<boolean> {
  if (!Number.isSafeInteger(input.limit) || input.limit < 1 || input.limit > 100 ||
      !Number.isSafeInteger(input.windowSeconds) || input.windowSeconds < 1 ||
      input.windowSeconds > 86400 || !input.key || input.key.length > 320) {
    throw new Error("Invalid public authentication quota");
  }
  const secret = env.JWT_SECRET;
  if (!secret || secret.length < 32 ||
      (process.env.NODE_ENV === "production" && secret.includes("development-secret"))) {
    throw new Error("Auth quota secret is not production safe");
  }
  const digest = createHmac("sha256",secret)
    .update("auth-quota-v1:" + input.scope + ":" + input.key).digest("hex");
  return prisma.$transaction(async tx => {
    await tx.$queryRaw<Array<{locked:string}>>`
      SELECT pg_advisory_xact_lock(
        hashtext(${digest}), hashtext('naksharix-public-auth-v1')
      )::text AS locked
    `;
    const count = await tx.auditLog.count({ where: {
      action: "auth.rate.attempt",
      targetType: input.scope,
      targetId: digest,
      createdAt: { gte: new Date(Date.now() - input.windowSeconds*1000) }
    } });
    if(count >= input.limit) return false;
    await tx.auditLog.create({ data: {
      action: "auth.rate.attempt",
      actorRole: "ANONYMOUS",
      targetType: input.scope,
      targetId: digest,
      metadata: { scope: input.scope, piiStored: false }
    } });
    return true;
  });
}
