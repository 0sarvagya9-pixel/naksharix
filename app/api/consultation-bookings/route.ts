import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { canBypassPayment } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";

const schema = z.object({
  astrologerProfileId: z.string().min(1),
  mode: z.enum(["CHAT", "AUDIO", "VIDEO"]),
  scheduledAt: z.coerce.date(),
  durationMins: z.coerce.number().min(10).max(120).default(30),
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
    const profile = await prisma.astrologerProfile.findFirst({ where: { id: body.astrologerProfileId, status: "APPROVED" } });
    if (!profile) return fail("Astrologer profile not found", 404);
    const adminBypass = canBypassPayment(user);
    const booking = await prisma.consultationBooking.create({
      data: {
        astrologerProfileId: profile.id,
        userId: user.id,
        mode: body.mode,
        scheduledAt: body.scheduledAt,
        durationMins: body.durationMins,
        birthName: body.customerName,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        birthTime: body.birthTime || null,
        birthPlace: body.birthPlace || null,
        question: body.question,
        amount: adminBypass ? 0 : profile.consultationPrice,
        status: "PENDING",
        paymentStatus: adminBypass ? "ADMIN_BYPASS" : "PENDING",
        metadata: {
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone || null,
          adminBypass,
          bookingDate: body.scheduledAt.toISOString().slice(0, 10),
          startTime: body.scheduledAt.toISOString().slice(11, 16)
        }
      }
    });
    return ok({ booking, redirectTo: `/consultation/success/${booking.id}` }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
