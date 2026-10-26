import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { readConsultationMeetingUrl, validateConsultationMeetingUrl } from "@/lib/consultations/meeting-link";

const schema = z.object({
  bookingId: z.string().min(1).max(120),
  meetingLink: z.string().min(1).max(600)
}).strict();
const active = ["ACCEPTED", "CONFIRMED"];
const authorizedPayment = ["PAID", "FREE", "ADMIN_BYPASS"];

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const bookingId = request.nextUrl.searchParams.get("bookingId") ?? "";
    if (!bookingId || bookingId.length > 120) return fail("Invalid booking ID", 422);
    const booking = await prisma.consultationBooking.findUnique({
      where: { id: bookingId }, select: {
        userId: true, astrologerProfile: { select: { userId: true } },
        status: true, paymentStatus: true, metadata: true, scheduledAt: true, mode: true
      }
    });
    const admin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);
    if (!booking || (!admin && user.id !== booking.userId &&
      user.id !== booking.astrologerProfile.userId)) return fail("Booking not found", 404);
    if (!active.includes(booking.status) ||
        !authorizedPayment.includes(booking.paymentStatus)) {
      return ok({ assigned: false, eligible: false, meetingLink: null });
    }
    const link = readConsultationMeetingUrl(booking.metadata);
    return ok({
      assigned: Boolean(link),
      eligible: true,
      meetingLink: link,
      scheduledAt: booking.scheduledAt,
      mode: booking.mode,
      // A third-party meeting URL is NOT proof that a call provider is online.
      providerReady: false,
      externalProviderRequired: true
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const input = await validateJson(request, schema);
    const meetingLink = validateConsultationMeetingUrl(input.meetingLink);
    if (!meetingLink) return fail("Only an approved HTTPS meeting-provider link is allowed", 422);
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.consultationBooking.findUnique({
        where: { id: input.bookingId },
        select: {
          id: true, userId: true, status: true, paymentStatus: true, metadata: true,
          astrologerProfile: { select: { userId: true } }
        }
      });
      const admin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);
      if (!booking || (!admin && booking.astrologerProfile.userId !== user.id)) {
        return { status: 404 as const };
      }
      // Do not confirm unpaid bookings or initiate payment from this route.
      if (!active.includes(booking.status) ||
          !authorizedPayment.includes(booking.paymentStatus)) {
        return { status: 409 as const };
      }
      const original = booking.metadata && typeof booking.metadata === "object" &&
        !Array.isArray(booking.metadata) ? booking.metadata as Record<string, unknown> : {};
      await tx.consultationBooking.update({
        where: { id: booking.id },
        data: { metadata: {
          ...original,
          meetingLink,
          meetingLinkAssignedAt: new Date().toISOString()
        } as Prisma.InputJsonObject }
      });
      return { status: 200 as const };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (result.status === 404) return fail("Booking not found", 404);
    if (result.status === 409) return fail("Only confirmed, eligible sessions can receive links", 409);
    return ok({ saved: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return fail("This appointment changed concurrently. Retry.", 409);
    }
    return handleApiError(error);
  }
}
