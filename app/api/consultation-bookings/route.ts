import { NextRequest } from "next/server";
import { ConsultationMode, Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { canBypassPayment } from "@/lib/auth/permissions";
import { sendConsultationBookingEmail } from "@/lib/consultations/booking-email";
import { prisma } from "@/lib/db";
import { hasConsultationConflict, lockConsultationCalendar } from "@/lib/consultations/booking-conflicts";
import { logger } from "@/lib/monitoring/logger";
import { consultationSlotWeekday, parseConsultationSlotTime } from "@/lib/consultations/slot-time";
import { CONSULTATION_SESSION_MINUTES, getConsultationSessionPrice } from "@/lib/consultations/pricing";
import {isBookableConsultationSlot,verifiedConsultationPractitioner,validOptionalConsultationBirth} from "@/lib/consultations/slot-contract";

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
}).strict().refine(x=>validOptionalConsultationBirth(x.birthDate,x.birthTime),"Enter a real past birth date and valid optional birth time.");

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Please sign in to book a consultation", 401);
    const body = await validateJson(request, schema);
    if (body.customerEmail.toLowerCase() !== user.email.toLowerCase())
      return fail("Consultation confirmation email must match your signed-in account.", 403);

    const profile = await prisma.astrologerProfile.findFirst({
      where: { id: body.astrologerProfileId, status: "APPROVED" },
      include:{user:{select:{role:true,emailVerified:true,emailVerifiedAt:true}}}
    });
    if (!profile||!verifiedConsultationPractitioner(profile)) return fail("Astrologer profile not found", 404);
    const sessionPrice = getConsultationSessionPrice(Number(profile.consultationPrice),
      profile.pricePerSession === null ? null : Number(profile.pricePerSession));
    if (sessionPrice === null) return fail("This astrologer has no verified positive session fee.", 422);

    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        id: body.slotId,
        astrologerProfileId: profile.id,
        isActive: true,
        isHoliday: false
      }
    });
    if (!slot||!isBookableConsultationSlot(slot)) return fail("Selected slot is invalid, inactive or shorter than a full session", 422);

    const scheduledAt = parseConsultationSlotTime(body.bookingDate, slot.startTime);
    if (!scheduledAt || scheduledAt < new Date()) {
      return fail("Please choose a valid future appointment time", 422);
    }

    if (consultationSlotWeekday(body.bookingDate) !== slot.dayOfWeek) {
      return fail("Selected slot does not match the day of week for the booking date", 422);
    }

    const adminBypass = canBypassPayment(user);
    const mode = slot.consultationType === "CALL" ? "AUDIO" : slot.consultationType;

    const booking = await prisma.$transaction(async (tx) => {
      await lockConsultationCalendar(tx, profile.id);
      // Lock authoritative rows against concurrent slot/approval/price edits.
      // Under Serializable, a changed row after the initial snapshot aborts
      // rather than creating a booking from stale public information.
      const lockedProfile=await tx.$queryRaw<Array<{id:string}>>`SELECT id FROM "AstrologerProfile" WHERE id=${profile.id} FOR UPDATE`;
      const lockedSlot=await tx.$queryRaw<Array<{id:string}>>`SELECT id FROM "AvailabilitySlot" WHERE id=${slot.id} AND "astrologerProfileId"=${profile.id} FOR UPDATE`;
      if(!lockedProfile.length||!lockedSlot.length)return null;
      const fresh=await tx.astrologerProfile.findUnique({where:{id:profile.id},include:{user:{select:{role:true,emailVerified:true,emailVerifiedAt:true}}}});
      const freshSlot=await tx.availabilitySlot.findUnique({where:{id:slot.id}});
      if(!fresh||!verifiedConsultationPractitioner(fresh)||!freshSlot||!isBookableConsultationSlot(freshSlot)||
        freshSlot.dayOfWeek!==slot.dayOfWeek||freshSlot.startTime!==slot.startTime||freshSlot.endTime!==slot.endTime||freshSlot.consultationType!==slot.consultationType||
        scheduledAt.getTime()<=Date.now()||getConsultationSessionPrice(Number(fresh.consultationPrice),fresh.pricePerSession===null?null:Number(fresh.pricePerSession))!==sessionPrice)return null;
      const collision = await hasConsultationConflict(tx, profile.id, scheduledAt, CONSULTATION_SESSION_MINUTES);
      if (collision) return null;

      return tx.consultationBooking.create({
        data: {
          astrologerProfileId: profile.id,
          userId: user.id,
          mode: mode as ConsultationMode,
          scheduledAt,
          durationMins: CONSULTATION_SESSION_MINUTES,
          birthName: body.customerName,
          birthDate: body.birthDate ? new Date(body.birthDate) : null,
          birthTime: body.birthTime || null,
          birthPlace: body.birthPlace || null,
          question: body.question,
          amount: adminBypass ? 0 : sessionPrice,
          status: adminBypass ? "CONFIRMED" : "REQUESTED",
          paymentStatus: adminBypass ? "ADMIN_BYPASS" : "PENDING",
          metadata: {
            customerName: body.customerName,
            customerEmail: body.customerEmail,
            customerPhone: body.customerPhone || null,
            adminBypass,
            bookingDate: body.bookingDate,
            startTime: slot.startTime,
            slotId: body.slotId,
            displayedSessionPrice: sessionPrice,
            pricingRule: profile.pricePerSession !== null ? "per_session" : "per_minute_times_30"
          }
        }
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (!booking) {
      return fail("This slot was booked or its availability or fee changed. Refresh and choose an available slot.", 409);
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
