import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const schema = z.object({
  bookingId: z.string().min(1),
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

    const existingMetadata = booking.metadata && typeof booking.metadata === "object" ? booking.metadata as Record<string, unknown> : {};
    const updatedMetadata = {
      ...existingMetadata,
      meetingLink: body.meetingLink !== undefined ? body.meetingLink : existingMetadata.meetingLink,
      adminNote: body.adminNote !== undefined ? body.adminNote : existingMetadata.adminNote,
      astrologerNote: body.astrologerNote !== undefined ? body.astrologerNote : existingMetadata.astrologerNote
    };

    const updated = await prisma.consultationBooking.update({
      where: { id: body.bookingId },
      data: {
        status: body.status || undefined,
        paymentStatus: body.paymentStatus || undefined,
        metadata: updatedMetadata as Prisma.InputJsonValue
      }
    });

    await prisma.adminActionLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_CONSULTATION_BOOKING",
        targetType: "ConsultationBooking",
        targetId: body.bookingId,
        metadata: { status: body.status, paymentStatus: body.paymentStatus }
      }
    });

    return ok({ booking: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
