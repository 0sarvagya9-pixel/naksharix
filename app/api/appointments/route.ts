import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { featuredAstrologers } from "@/lib/astrologers";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

const schema = z.object({
  astrologerId: z.string(),
  mode: z.enum(["CHAT", "AUDIO", "VIDEO"]),
  scheduledAt: z.coerce.date(),
  durationMins: z.number().min(10).max(120),
  notes: z.string().max(500).optional()
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const body = await validateJson(request, schema);
    if (body.scheduledAt < new Date()) return fail("Please choose a future appointment time", 422);

    const demoAstrologer = featuredAstrologers.find((astrologer) => astrologer.id === body.astrologerId);
    if (demoAstrologer) {
      return ok(
        {
          appointment: {
            id: `demo-${Date.now()}`,
            ...body,
            userId: user.id,
            astrologer: demoAstrologer,
            status: "REQUESTED"
          }
        },
        { status: 201 }
      );
    }

    const appointment = await prisma.appointment.create({ data: { ...body, userId: user.id } });
    return ok({ appointment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
