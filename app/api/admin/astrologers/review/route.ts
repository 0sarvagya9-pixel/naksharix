import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

const schema = z.object({
  profileId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "PENDING"]),
  reason: z.string().max(500).optional()
});

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) return fail("Unauthorized", 403);
    const body = await validateJson(request, schema);
    const data = body.action === "APPROVE"
      ? { status: "APPROVED" as const, approvedAt: new Date(), rejectedAt: null, rejectionReason: null }
      : body.action === "REJECT"
        ? { status: "REJECTED" as const, rejectedAt: new Date(), approvedAt: null, rejectionReason: body.reason ?? "Rejected by admin" }
        : { status: "PENDING_REVIEW" as const, approvedAt: null, rejectedAt: null, rejectionReason: null };
    const profile = await prisma.astrologerProfile.update({ where: { id: body.profileId }, data });
    await prisma.adminActionLog.create({
      data: {
        adminId: admin.id,
        action: body.action === "APPROVE" ? "APPROVE_ASTROLOGER_PROFILE" : body.action === "REJECT" ? "REJECT_ASTROLOGER_PROFILE" : "PENDING_ASTROLOGER_PROFILE",
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