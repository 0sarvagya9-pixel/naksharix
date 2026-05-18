import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

const schema = z.object({ role: z.enum(["ASTROLOGER", "CONSULTANT"]).default("ASTROLOGER") });

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", 401);
    if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Admin users do not need astrologer onboarding", 400);
    const body = await validateJson(request, schema);
    const nextRole = body.role;
    await prisma.user.update({ where: { id: user.id }, data: { role: nextRole } });
    if (nextRole === "ASTROLOGER") {
      await prisma.astrologerProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, displayName: user.name || user.email, bio: "", status: "PENDING_REVIEW" },
        update: { status: "PENDING_REVIEW" }
      });
    } else {
      await prisma.consultantProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, displayName: user.name || user.email, bio: "", status: "PENDING_REVIEW" },
        update: { status: "PENDING_REVIEW" }
      });
    }
    return ok({ redirectTo: "/astrologer/profile" });
  } catch (error) {
    return handleApiError(error);
  }
}
