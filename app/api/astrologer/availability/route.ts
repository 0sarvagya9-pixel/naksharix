import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isHoliday: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  consultationType: z.enum(["CHAT", "CALL", "VIDEO"]).default("CHAT"),
  status: z.enum(["ONLINE", "BUSY", "OFFLINE"]).default("ONLINE")
});

const updateSchema = z.object({
  slotId: z.string().min(1),
  isActive: z.coerce.boolean().optional(),
  status: z.enum(["ONLINE", "BUSY", "OFFLINE"]).optional()
});

const deleteSchema = z.object({ slotId: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ASTROLOGER", "CONSULTANT"].includes(user.effectiveRole ?? "")) return fail("Unauthorized", 403);
    const profile = await prisma.astrologerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return fail("Create an astrologer profile first", 422);
    const body = await validateJson(request, createSchema);
    const slot = await prisma.availabilitySlot.create({ data: { astrologerProfileId: profile.id, ...body } });
    await prisma.astrologerProfile.update({ where: { id: profile.id }, data: { availabilityStatus: body.status } });
    return ok({ slot }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ASTROLOGER", "CONSULTANT"].includes(user.effectiveRole ?? "")) return fail("Unauthorized", 403);
    const profile = await prisma.astrologerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return fail("Astrologer profile not found", 404);
    const body = await validateJson(request, updateSchema);
    const slot = await prisma.availabilitySlot.findUnique({ where: { id: body.slotId } });
    if (!slot || slot.astrologerProfileId !== profile.id) return fail("Availability slot not found", 404);
    const updated = await prisma.availabilitySlot.update({ where: { id: body.slotId }, data: { isActive: body.isActive, status: body.status } });
    return ok({ slot: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ASTROLOGER", "CONSULTANT"].includes(user.effectiveRole ?? "")) return fail("Unauthorized", 403);
    const profile = await prisma.astrologerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return fail("Astrologer profile not found", 404);
    const body = await validateJson(request, deleteSchema);
    const slot = await prisma.availabilitySlot.findUnique({ where: { id: body.slotId } });
    if (!slot || slot.astrologerProfileId !== profile.id) return fail("Availability slot not found", 404);
    await prisma.availabilitySlot.delete({ where: { id: body.slotId } });
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}