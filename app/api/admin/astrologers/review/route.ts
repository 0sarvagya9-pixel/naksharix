import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

const schema = z.object({
  profileId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().max(500).optional()
});

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) return fail("Unauthorized", 403);
    const body = await validateJson(request, schema);
    const profile = await prisma.astrologerProfile.update({
      where: { id: body.profileId },
      data: body.action === "APPROVE"
        ? { status: "APPROVED", approvedAt: new Date(), rejectedAt: null, rejectionReason: null }
        : { status: "REJECTED", rejectedAt: new Date(), rejectionReason: body.reason ?? "Rejected by admin" }
    });
    await prisma.adminActionLog.create({
      data: {
        adminId: admin.id,
        action: body.action === "APPROVE" ? "APPROVE_ASTROLOGER_PROFILE" : "REJECT_ASTROLOGER_PROFILE",
        targetType: "AstrologerProfile",
        targetId: body.profileId,
        metadata: { reason: body.reason }
      }
    });
    return ok({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}
