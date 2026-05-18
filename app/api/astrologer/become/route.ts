import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser, setAuthCookie } from "@/lib/auth/jwt";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const schema = z.object({ role: z.enum(["ASTROLOGER", "CONSULTANT"]).default("ASTROLOGER") });

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", 401);
    if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Admin users do not need astrologer onboarding", 400);

    const body = await validateJson(request, schema);
    const nextRole = body.role;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: nextRole },
      select: { id: true, email: true, name: true, role: true }
    });

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

    const token = await createSession({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role
    }, request);
    await setAuthCookie(token);

    return ok({ redirectTo: "/astrologer/profile", role: updatedUser.role });
  } catch (error) {
    return handleApiError(error);
  }
}