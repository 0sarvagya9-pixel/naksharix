import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { appendSupportMessage } from "@/lib/support/append-message";
import { notifyCustomerOfSupportReply } from "@/lib/notifications/support-updates";
import { writeAuditLog } from "@/lib/reports/report-audit";

const schema = z.object({
  ticketId: z.string().min(1),
  message: z.string().trim().min(2).max(1200),
  clientMutationId: z.string().uuid()
}).strict();

export async function POST(request: Request) {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Not found", 404);
    const input = await validateJson(request, schema);
    const result = await appendSupportMessage({
      ticketId: input.ticketId,
      sender: "ADMIN",
      message: input.message,
      clientMutationId: input.clientMutationId
    });
    if (result.kind === "not_found") return fail("Ticket not found", 404);
    if (result.kind === "closed") return fail("Reopen the ticket before replying.", 409);
    if (result.kind === "full") return fail("Conversation limit reached.", 409);

    if (result.kind !== "ok") return fail("Unable to append support reply.", 409);
    if (!result.duplicate) {
      await writeAuditLog({
        actor: admin,
        action: "support_ticket.staff_replied",
        targetType: "SupportTicket",
        targetId: input.ticketId,
        metadata: { replyRecorded: true }
      });
    }
    // Never send a second message for a duplicate client mutation id.
    // Staff reply is committed before provider acceptance is attempted.
    const notification = result.duplicate ? "not_needed" :
      await notifyCustomerOfSupportReply(input.ticketId);
    return ok({ recorded: true, duplicate: result.duplicate, notification });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return fail("Ticket changed at the same time. Retry the reply.", 409);
    }
    return handleApiError(error);
  }
}
