import "server-only";
import { createHmac } from "node:crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

/** An expensive AI inference must not rely on per-instance memory counters.
 * Only a keyed one-way digest is persisted, never the client's raw IP.
 */
export async function claimAnonymousAiQuota(request: Request): Promise<boolean> {
  const secret = env.NEXTAUTH_SECRET || env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("AI quota signing secret unavailable");
  // Vercel overwrites forwarded IP headers, and exposes a dedicated trusted
  // copy. Local isolated QA can use x-forwarded-for as a fixture.
  const rawIp = (
    (process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") : null) ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown-client"
  ).split(",")[0].trim().slice(0, 128) || "unknown-client";
  const ipHash = createHmac("sha256", secret).update("ai-chat-v1:" + rawIp).digest("hex");

  return prisma.$transaction(async tx => {
    await tx.$queryRaw<Array<{ locked: string }>>`
      SELECT pg_advisory_xact_lock(
        hashtext(${ipHash}), hashtext('naksharix-ai-chat-v1')
      )::text AS locked
    `;
    const count = await tx.auditLog.count({ where: {
      action: "ai.chat.rate.attempt",
      targetType: "AiChatQuota",
      targetId: ipHash,
      createdAt: { gte: new Date(Date.now() - 86400_000) }
    } });
    if (count >= 20) return false;
    await tx.auditLog.create({ data: {
      action: "ai.chat.rate.attempt",
      actorRole: "ANONYMOUS_OR_PUBLIC",
      targetType: "AiChatQuota",
      targetId: ipHash,
      metadata: { scope: "free-ai-chat", ipStored: false }
    } });
    return true;
  });
}
