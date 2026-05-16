import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

const schema = z.object({
  astrologerProfileId: z.string().min(1),
  mode: z.enum(["CHAT", "AUDIO", "VIDEO"]),
  scheduledAt: z.coerce.date(),
  durationMins: z.coerce.number().min(10).max(120).default(30),
  birthName: z.string().min(2).max(80),
  birthDate: z.coerce.date(),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/),
  birthPlace: z.string().min(2).max(120),
  question: z.string().min(5).max(800)
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Please sign in to book a consultation", 401);
    const body = await validateJson(request, schema);
    const paymentReady = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
    if (body.astrologerProfileId.startsWith("demo-")) {
      return ok({
        booking: {
          id: `demo-booking-${Date.now()}`,
          ...body,
          userId: user.id,
          status: "REQUESTED",
          paymentStatus: "PENDING",
          amount: 0,
          demo: true
        },
        paymentMessage: paymentReady ? "Payment order can be created next." : "Payment coming soon. Demo booking created."
      }, { status: 201 });
    }
    const profile = await prisma.astrologerProfile.findUnique({ where: { id: body.astrologerProfileId } });
    if (!profile) return fail("Astrologer profile not found", 404);
    const booking = await prisma.consultationBooking.create({
      data: {
        ...body,
        userId: user.id,
        amount: profile.consultationPrice,
        status: paymentReady ? "PAYMENT_PENDING" : "REQUESTED",
        paymentStatus: "PENDING",
        metadata: { paymentPlaceholder: !paymentReady }
      }
    });
    return ok({ booking, paymentMessage: paymentReady ? "Payment order can be created next." : "Payment coming soon. Demo booking created." }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
