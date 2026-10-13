import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const createSchema = z.object({
  subject: z.string().trim().min(5).max(140),
  message: z.string().trim().min(10).max(2000)
}).strict();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
      select: {
        id: true, subject: true, status: true, priority: true,
        messages: true, createdAt: true, updatedAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });
    return ok({ tickets }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const limited = await rateLimit("support-create:" + user.id, 5, 3600);
    if (!limited.allowed) return fail("Too many support requests. Please try again later.", 429);
    const input = await validateJson(request, createSchema);
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: input.subject,
        status: "OPEN",
        priority: "NORMAL",
        messages: [{ author: "USER", text: input.message, at: new Date().toISOString() }]
      },
      select: {
        id: true, subject: true, status: true, priority: true,
        messages: true, createdAt: true, updatedAt: true
      }
    });
    return ok({ ticket }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}
