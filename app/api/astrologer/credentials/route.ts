import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { isIP } from "node:net";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { credentialState } from "@/lib/astrologers/credentials";
import { rateLimit } from "@/lib/rate-limit";

const evidenceSchema = z.object({
  credentialName: z.string().trim().min(4).max(120),
  issuer: z.string().trim().min(3).max(120),
  issuedYear: z.number().int().min(1950).max(2026),
  referenceUrl: z.string().url().max(500)
}).strict();

function safeReferenceUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      !url.port && url.hostname.includes(".") &&
      !["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname) &&
      isIP(url.hostname) === 0 &&
      !url.hash && !url.hostname.endsWith(".local");
  } catch { return false; }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ASTROLOGER") return fail("Unauthenticated", 401);
    const profile = await prisma.astrologerProfile.findUnique({
      where: { userId: user.id }, select: { certificates: true }
    });
    if (!profile) return fail("Astrologer profile not found", 404);
    return ok({ credentials: credentialState(profile.certificates) });
  } catch (error) { return handleApiError(error); }
}
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ASTROLOGER") return fail("Unauthorized", 403);
    const input = await validateJson(request, evidenceSchema);
    if (!safeReferenceUrl(input.referenceUrl)) {
      return fail("Use a public HTTPS credential reference without account credentials.", 422);
    }
    const limit = await rateLimit("credential-submit:" + user.id, 5, 86400);
    if (!limit.allowed) return fail("Too many submissions. Please try again later.", 429);
    const profile = await prisma.astrologerProfile.findUnique({
      where: { userId: user.id }, select: { id: true }
    });
    if (!profile) return fail("Astrologer profile not found", 404);
    await prisma.astrologerProfile.update({
      where: { id: profile.id }, data: {
        certificates: {
          evidence: input,
          reviewStatus: "PENDING",
          reviewedAt: null,
          reviewedBy: null,
          submittedAt: new Date().toISOString()
        } as Prisma.InputJsonObject
      }
    });
    return ok({ submitted: true, reviewStatus: "PENDING" });
  } catch (error) { return handleApiError(error); }
}
