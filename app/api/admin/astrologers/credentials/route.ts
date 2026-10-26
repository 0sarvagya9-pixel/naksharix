import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { credentialState } from "@/lib/astrologers/credentials";

const schema = z.object({
  profileId: z.string().min(1).max(120),
  decision: z.enum(["DOCUMENTS_REVIEWED", "REJECTED"]),
  note: z.string().trim().min(5).max(300)
}).strict();

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Not found", 404);
    const input = await validateJson(request, schema);
    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.astrologerProfile.findUnique({
        where: { id: input.profileId }, select: { id: true, certificates: true }
      });
      if (!profile) return false;
      const evidence = credentialState(profile.certificates).evidence;
      if (!evidence) return false;
      await tx.astrologerProfile.update({
        where: { id: profile.id },
        data: { certificates: {
          evidence, reviewStatus: input.decision,
          reviewedAt: new Date().toISOString(),
          reviewedBy: admin.id
        } as Prisma.InputJsonObject }
      });
      // Audit who made the decision; note is kept only inside admin evidence.
      await tx.adminActionLog.create({
        data: {
          adminId: admin.id,
          action: "REVIEW_ASTROLOGER_CREDENTIAL_DOCUMENT",
          targetType: "AstrologerProfile",
          targetId: profile.id,
          metadata: { decision: input.decision, note: input.note }
        }
      });
      return true;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (!result) return fail("Profile or evidence not found", 404);
    return ok({ recorded: true, decision: input.decision });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return fail("Credential record changed while reviewing. Retry.", 409);
    }
    return handleApiError(error);
  }
}
