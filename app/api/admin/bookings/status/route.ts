import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { validateConsultationMeetingUrl } from "@/lib/consultations/meeting-link";

const schema = z.object({
  bookingId: z.string().min(1),
  expectedUpdatedAt: z.string().datetime(),
  status: z.enum(["PENDING", "REQUESTED", "PAYMENT_PENDING", "ACCEPTED", "CONFIRMED", "REJECTED", "COMPLETED", "CANCELED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "ADMIN_BYPASS", "FREE"]).optional(),
  meetingLink: z.string().url().or(z.literal("")).optional(),
  adminNote: z.string().max(800).optional(),
  astrologerNote: z.string().max(800).optional()
});

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
      return fail("Unauthorized", 403);
    }
    const body = await validateJson(request, schema);
    const booking = await prisma.consultationBooking.findUnique({ where: { id: body.bookingId } });
    if (!booking) return fail("Booking not found", 404);
    const expectedUpdatedAt = new Date(body.expectedUpdatedAt);
    if (booking.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
      return fail("Booking changed. Refresh the saved record before trying again.", 409);
    }

    if (body.meetingLink !== undefined && body.meetingLink !== "" &&
        !validateConsultationMeetingUrl(body.meetingLink)) {
      return fail("A supported HTTPS meeting provider link is required.", 422);
    }
    const existingMetadata = booking.metadata && typeof booking.metadata === "object" ? booking.metadata as Record<string, unknown> : {};
    const updatedMetadata = {
      ...existingMetadata,
      meetingLink: body.meetingLink !== undefined ? body.meetingLink : existingMetadata.meetingLink,
      adminNote: body.adminNote !== undefined ? body.adminNote : existingMetadata.adminNote,
      astrologerNote: body.astrologerNote !== undefined ? body.astrologerNote : existingMetadata.astrologerNote
    };

    // Use the existing timestamp as an optimistic version. A concurrent admin,
    // payment webhook or practitioner update must invalidate the saved draft.
    // Advance by at least one millisecond even if two requests share a clock tick.
    const nextUpdatedAt = new Date(Math.max(Date.now(), booking.updatedAt.getTime() + 1));
    const updated = await prisma.$transaction(async tx => {
      const change = await tx.consultationBooking.updateMany({
        where: {
          id: body.bookingId,
          updatedAt: expectedUpdatedAt,
          status: booking.status,
          paymentStatus: booking.paymentStatus
        },
        data: {
          status: body.status || undefined,
          paymentStatus: body.paymentStatus || undefined,
          metadata: updatedMetadata as Prisma.InputJsonValue,
          updatedAt: nextUpdatedAt
        }
      });
      if (change.count !== 1) return null;
      const saved = await tx.consultationBooking.findUniqueOrThrow({where:{id:body.bookingId}});
      await tx.adminActionLog.create({
        data: {
          adminId: admin.id,
          action: "UPDATE_CONSULTATION_BOOKING",
          targetType: "ConsultationBooking",
          targetId: body.bookingId,
          metadata: { status: body.status, paymentStatus: body.paymentStatus }
        }
      });
      return saved;
    });
    if (!updated) return fail("Booking changed. Refresh the saved record before trying again.", 409);

    return ok({ booking: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
