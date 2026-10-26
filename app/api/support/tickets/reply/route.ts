import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { appendSupportMessage } from "@/lib/support/append-message";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  ticketId: z.string().min(1),
  message: z.string().trim().min(2).max(1200),
  clientMutationId: z.string().uuid()
}).strict();

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const limit = await rateLimit("support-reply:" + user.id, 25, 3600);
    if (!limit.allowed) return fail("Too many replies. Try later.", 429);
    const input = await validateJson(request, schema);
    const result = await appendSupportMessage({
      ticketId: input.ticketId,
      sender: "USER",
      userId: user.id,
      message: input.message,
      clientMutationId: input.clientMutationId
    });
    if (result.kind === "not_found") return fail("Ticket not found", 404);
    if (result.kind === "closed") return fail("Ticket is closed. Open a new request for more help.", 409);
    if (result.kind === "full") return fail("Conversation limit reached. Open a new ticket.", 409);

    if (result.kind !== "ok") return fail("Unable to append support reply.", 409);    return ok({ recorded: true, duplicate: result.duplicate });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return fail("Ticket changed at the same time. Retry the reply.", 409);
    }
    return handleApiError(error);
  }
}
