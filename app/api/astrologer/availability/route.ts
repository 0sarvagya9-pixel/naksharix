import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

const schema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isHoliday: z.coerce.boolean().default(false),
  status: z.enum(["ONLINE", "BUSY", "OFFLINE"]).default("ONLINE")
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ASTROLOGER", "CONSULTANT", "ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Unauthorized", 403);
    const profile = await prisma.astrologerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return fail("Create an astrologer profile first", 422);
    const body = await validateJson(request, schema);
    const slot = await prisma.availabilitySlot.create({ data: { astrologerProfileId: profile.id, ...body } });
    await prisma.astrologerProfile.update({ where: { id: profile.id }, data: { availabilityStatus: body.status } });
    return ok({ slot }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
