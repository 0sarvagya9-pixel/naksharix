import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { FREE_LESSON_IDS } from "@/lib/learning/lessons";

const schema = z.object({
  lessonId: z.enum(FREE_LESSON_IDS),
  completed: z.boolean()
}).strict();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const records = await prisma.learningProgress.findMany({
      where: { userId: user.id, completedAt: { not: null } },
      select: { lessonId: true },
      take: FREE_LESSON_IDS.length
    });
    return ok({
      completed: records.map((x) => x.lessonId).filter((id) =>
        FREE_LESSON_IDS.some((known) => known === id)),
      totalLessons: FREE_LESSON_IDS.length
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return fail("Learning progress storage is not provisioned yet.", 503);
    }
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const input = await validateJson(request, schema);
    const limit = await rateLimit("learning-progress:" + user.id, 30, 3600);
    if (!limit.allowed) return fail("Too many learning progress changes.", 429);
    const result = await prisma.learningProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: input.lessonId } },
      create: {
        userId: user.id, lessonId: input.lessonId,
        completedAt: input.completed ? new Date() : null
      },
      update: { completedAt: input.completed ? new Date() : null },
      select: { lessonId: true, completedAt: true }
    });
    return ok({ lessonId: result.lessonId, completed: Boolean(result.completedAt) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return fail("Learning progress storage is not provisioned yet.", 503);
    }
    return handleApiError(error);
  }
}
