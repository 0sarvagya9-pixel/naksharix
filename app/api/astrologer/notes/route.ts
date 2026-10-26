import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

const schema = z.object({
  userId: z.string().min(1),
  title: z.string().min(2).max(120),
  body: z.string().min(5).max(2000),
  private: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ASTROLOGER") return fail("Unauthorized", 403);
    const profile = await prisma.astrologerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return fail("Astrologer profile not found", 404);
    const body = await validateJson(request, schema);
    if (!body.private) return fail("Consultation notes must remain private", 422);
    const booking = await prisma.consultationBooking.findFirst({
      where: {
        astrologerProfileId: profile.id,
        userId: body.userId,
        status: { in: ["ACCEPTED", "CONFIRMED", "COMPLETED"] },
        paymentStatus: { in: ["PAID", "FREE", "ADMIN_BYPASS"] }
      }, select: { id: true }
    });
    if (!booking) return fail("No eligible consultation with this customer", 404);
    const note = await prisma.astrologerNote.create({
      data: {
        astrologerProfileId: profile.id,
        userId: body.userId,
        title: body.title,
        body: body.body,
        private: true
      }
    });
    return ok({ note }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
