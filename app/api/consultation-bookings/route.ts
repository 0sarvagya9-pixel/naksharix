import { NextRequest } from "next/server";
import { ConsultationMode, Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { canBypassPayment } from "@/lib/auth/permissions";
import { sendConsultationBookingEmail } from "@/lib/consultations/booking-email";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/monitoring/logger";

const schema = z.object({
  astrologerProfileId: z.string().min(1),
  slotId: z.string().min(1),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  customerName: z.string().min(2).max(80),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(30).optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  birthTime: z.string().optional().or(z.literal("")),
  birthPlace: z.string().max(160).optional().or(z.literal("")),
  question: z.string().min(5).max(800)
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Please sign in to book a consultation", 401);
    const body = await validateJson(request, schema);

    const profile = await prisma.astrologerProfile.findFirst({
      where: { id: body.astrologerProfileId, status: "APPROVED" }
    });
    if (!profile) return fail("Astrologer profile not found", 404);

    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        id: body.slotId,
        astrologerProfileId: profile.id,
        isActive: true,
        isHoliday: false
      }
    });
    if (!slot) return fail("Selected slot is invalid or inactive", 422);

    const scheduledAt = new Date(`${body.bookingDate}T${slot.startTime}:00`);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt < new Date()) {
      return fail("Please choose a valid future appointment time", 422);
    }

    if (scheduledAt.getDay() !== slot.dayOfWeek) {
      return fail("Selected slot does not match the day of week for the booking date", 422);
    }

    const adminBypass = canBypassPayment(user);
    const mode = slot.consultationType === "CALL" ? "AUDIO" : slot.consultationType;

    const booking = await prisma.$transaction(async (tx) => {
      const collision = await tx.consultationBooking.findFirst({
        where: {
          astrologerProfileId: profile.id,
          scheduledAt,
          status: { in: ["ACCEPTED", "CONFIRMED", "COMPLETED"] }
        },
        select: { id: true }
      });
      if (collision) return null;

      return tx.consultationBooking.create({
        data: {
          astrologerProfileId: profile.id,
          userId: user.id,
          mode: mode as ConsultationMode,
          scheduledAt,
          durationMins: 30,
          birthName: body.customerName,
          birthDate: body.birthDate ? new Date(body.birthDate) : null,
          birthTime: body.birthTime || null,
          birthPlace: body.birthPlace || null,
          question: body.question,
          amount: adminBypass ? 0 : profile.consultationPrice,
          status: adminBypass ? "CONFIRMED" : "REQUESTED",
          paymentStatus: adminBypass ? "ADMIN_BYPASS" : "PENDING",
          metadata: {
            customerName: body.customerName,
            customerEmail: body.customerEmail,
            customerPhone: body.customerPhone || null,
            adminBypass,
            bookingDate: body.bookingDate,
            startTime: slot.startTime,
            slotId: body.slotId
          }
        }
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (!booking) {
      return fail("This slot has already been booked for this date and time. Please select another slot.", 409);
    }

    let emailSent = false;
    try {
      const delivery = await sendConsultationBookingEmail({
        to: body.customerEmail,
        customerName: body.customerName,
        astrologerName: profile.displayName,
        bookingId: booking.id,
        scheduledAt: booking.scheduledAt,
        paymentRequired: !adminBypass
      });
      emailSent = delivery.sent;
      if (!delivery.sent) {
        logger.warn("consultation_booking_email_not_sent", { bookingId: booking.id });
      }
    } catch {
      logger.warn("consultation_booking_email_failed", { bookingId: booking.id });
    }

    return ok({ booking, emailSent, redirectTo: `/consultation/success/${booking.id}` }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return fail("This slot was booked at the same time by another user. Please select another slot.", 409);
    }
    return handleApiError(error);
  }
}
