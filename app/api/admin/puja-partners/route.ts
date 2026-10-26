import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  name: z.string().trim().min(3).max(100),
  region: z.string().trim().min(3).max(100),
  traditions: z.array(z.string().trim().min(2).max(80)).min(1).max(10),
  evidenceUrl: z.string().url().max(500).optional()
}).strict();
const reviewSchema = z.object({
  partnerId: z.string().min(1).max(120),
  decision: z.enum(["VERIFIED", "REJECTED", "SUSPENDED"]),
  note: z.string().trim().min(5).max(300)
}).strict();

function allowedEvidenceUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      !url.port && url.hostname.includes(".") && !url.hostname.endsWith(".local");
  } catch { return false; }
}
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Not found", 404);
    const partners = await prisma.pujaPartner.findMany({
      orderBy: { createdAt: "desc" }, take: 100
    });
    return ok({ partners });
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Not found", 404);
    const input = await validateJson(request, createSchema);
    if (input.evidenceUrl && !allowedEvidenceUrl(input.evidenceUrl)) {
      return fail("Evidence must be a public HTTPS reference.", 422);
    }
    const partner = await prisma.pujaPartner.create({
      data: {
        name: input.name, region: input.region,
        traditions: [...new Set(input.traditions)],
        evidenceUrl: input.evidenceUrl || null,
        reviewStatus: "PENDING"
      }, select: { id: true, reviewStatus: true }
    });
    return ok({ partner }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Not found", 404);
    const input = await validateJson(request, reviewSchema);
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.pujaPartner.findUnique({
        where: { id: input.partnerId },
        select: { id: true, evidenceUrl: true, reviewStatus: true }
      });
      if (!existing) return "not_found" as const;
      if (input.decision === "VERIFIED" && !existing.evidenceUrl) {
        return "missing_evidence" as const;
      }
      await tx.pujaPartner.update({
        where: { id: existing.id },
        data: {
          reviewStatus: input.decision,
          reviewedAt: new Date(), reviewedById: admin.id,
          reviewNote: input.note
        }
      });
      await tx.adminActionLog.create({
        data: {
          adminId: admin.id,
          action: "PUJA_PARTNER_REVIEW",
          targetType: "PujaPartner", targetId: existing.id,
          metadata: {
            previous: existing.reviewStatus,
            decision: input.decision
          }
        }
      });
      return "ok" as const;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (result === "not_found") return fail("Partner not found", 404);
    if (result === "missing_evidence") return fail("Evidence required before review.", 422);
    return ok({ recorded: true, reviewStatus: input.decision });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return fail("Another review changed this record. Retry.", 409);
    }
    return handleApiError(error);
  }
}
