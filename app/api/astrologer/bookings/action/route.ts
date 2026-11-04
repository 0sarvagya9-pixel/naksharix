import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { availableBookingActions } from "@/lib/consultations/booking-policy";
import { hasConsultationConflict, lockConsultationCalendar } from "@/lib/consultations/booking-conflicts";

const schema = z.object({
  bookingId: z.string().min(1),
  action: z.enum(["ACCEPT", "REJECT", "COMPLETE", "RESCHEDULE"]),
  scheduledAt: z.string().datetime({ offset: true }).transform(value => new Date(value)).optional(),
  reason: z.string().max(500).optional()
}).strict();
class BookingActionError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ASTROLOGER", "CONSULTANT", "ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Unauthorized", 403);
    const body = await validateJson(request, schema);
    const profile = await prisma.astrologerProfile.findUnique({ where: { userId: user.id } });
    if (!profile && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Astrologer profile not found", 404);
    if (body.action === "RESCHEDULE" && (!body.scheduledAt || body.scheduledAt.getTime() <= Date.now()))
      return fail("A valid future reschedule date and time with timezone is required.", 422);

    const result = await prisma.$transaction(async tx => {
      const booking = await tx.consultationBooking.findUnique({ where: { id: body.bookingId } });
      if (!booking) throw new BookingActionError("Booking not found", 404);
      if (profile && booking.astrologerProfileId !== profile.id) throw new BookingActionError("You cannot update this booking", 403);
      // Do not relax verified server-owned payment eligibility.
      if (body.action !== "REJECT" && !["PAID", "FREE", "ADMIN_BYPASS"].includes(booking.paymentStatus))
        throw new BookingActionError("Verified payment is required before this booking can be confirmed.", 409);
      const alreadyApplied = (body.action === "ACCEPT" && ["ACCEPTED", "CONFIRMED"].includes(booking.status)) ||
        (body.action === "COMPLETE" && booking.status === "COMPLETED") ||
        (body.action === "REJECT" && booking.status === "REJECTED");
      if (alreadyApplied) return { booking, unchanged: true };
      if (!availableBookingActions(booking.status, booking.paymentStatus).includes(body.action))
        throw new BookingActionError("This action is not allowed for the current booking status.", 422);
      await lockConsultationCalendar(tx, booking.astrologerProfileId);
      if (body.action === "RESCHEDULE") {
        if (!body.scheduledAt || body.scheduledAt.getTime() <= Date.now())
          throw new BookingActionError("Please choose a future consultation time.", 422);
        if (await hasConsultationConflict(tx, booking.astrologerProfileId, body.scheduledAt, booking.durationMins, booking.id))
          throw new BookingActionError("The requested time overlaps another reservation. Choose a different time.", 409);
      }
      const metadata = booking.metadata && typeof booking.metadata === "object" && !Array.isArray(booking.metadata)
        ? booking.metadata as Prisma.InputJsonObject : {};
      const data: Prisma.ConsultationBookingUpdateManyMutationInput = body.action === "ACCEPT"
        ? { status: "ACCEPTED" }
        : body.action === "REJECT"
          ? { status: "REJECTED", metadata: { ...metadata, reason: body.reason ?? "Rejected by astrologer" } }
          : body.action === "COMPLETE" ? { status: "COMPLETED" }
            : { status: "ACCEPTED", scheduledAt: body.scheduledAt };
      const changed = await tx.consultationBooking.updateMany({
        where: { id: booking.id, status: booking.status, paymentStatus: booking.paymentStatus, updatedAt: booking.updatedAt }, data
      });
      if (changed.count !== 1) throw new BookingActionError("The booking changed. Refresh its latest status before trying again.", 409);
      return { booking: await tx.consultationBooking.findUniqueOrThrow({ where: { id: booking.id } }), unchanged: false };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return ok(result);
  } catch (error) {
    if (error instanceof BookingActionError) return fail(error.message, error.status);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034")
      return fail("Another booking update happened at the same time. Refresh and choose an available time.", 409);
    return handleApiError(error);
  }
}
