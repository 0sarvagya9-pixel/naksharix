import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

const schema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  body: z.string().max(800).optional()
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Please sign in to review a consultation", 401);
    const body = await validateJson(request, schema);
    const booking = await prisma.consultationBooking.findUnique({ where: { id: body.bookingId }, include: { astrologerProfile: true } });
    if (!booking || booking.userId !== user.id) return fail("Booking not found", 404);
    if (booking.status !== "COMPLETED") return fail("Reviews are available after a completed consultation", 422);

    const review = await prisma.review.upsert({
      where: { consultationBookingId: body.bookingId },
      create: {
        userId: user.id,
        astrologerProfileId: booking.astrologerProfileId,
        consultationBookingId: body.bookingId,
        rating: body.rating,
        body: body.body
      },
      update: { rating: body.rating, body: body.body }
    });
    const aggregate = await prisma.review.aggregate({
      where: { astrologerProfileId: booking.astrologerProfileId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    await prisma.astrologerProfile.update({
      where: { id: booking.astrologerProfileId },
      data: { rating: aggregate._avg.rating ?? 0, reviewCount: aggregate._count.rating }
    });
    return ok({ review });
  } catch (error) {
    return handleApiError(error);
  }
}
