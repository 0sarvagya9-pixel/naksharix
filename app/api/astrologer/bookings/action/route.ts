import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

const schema = z.object({
  bookingId: z.string().min(1),
  action: z.enum(["ACCEPT", "REJECT", "COMPLETE", "RESCHEDULE"]),
  scheduledAt: z.coerce.date().optional(),
  reason: z.string().max(500).optional()
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ASTROLOGER", "ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Unauthorized", 403);
    const body = await validateJson(request, schema);
    const profile = await prisma.astrologerProfile.findUnique({ where: { userId: user.id } });
    if (!profile && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Astrologer profile not found", 404);
    const booking = await prisma.consultationBooking.findUnique({ where: { id: body.bookingId } });
    if (!booking) return fail("Booking not found", 404);
    if (profile && booking.astrologerProfileId !== profile.id) return fail("You cannot update this booking", 403);

    const data = body.action === "ACCEPT"
      ? { status: "ACCEPTED" as const }
      : body.action === "REJECT"
        ? { status: "REJECTED" as const, metadata: { reason: body.reason ?? "Rejected by astrologer" } }
        : body.action === "COMPLETE"
          ? { status: "COMPLETED" as const }
          : { status: "ACCEPTED" as const, scheduledAt: body.scheduledAt };

    if (body.action === "RESCHEDULE" && !body.scheduledAt) return fail("Reschedule date and time is required", 422);
    const updated = await prisma.consultationBooking.update({ where: { id: body.bookingId }, data });
    return ok({ booking: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
