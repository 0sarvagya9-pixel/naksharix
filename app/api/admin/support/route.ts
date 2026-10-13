import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/reports/report-audit";

const changeSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH"])
}).strict();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Not found", 404);
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, subject: true, status: true, priority: true,
        messages: true, createdAt: true, updatedAt: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });
    return ok({ tickets }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Not found", 404);
    const input = await validateJson(request, changeSchema);
    const previous = await prisma.supportTicket.findUnique({
      where: { id: input.ticketId },
      select: { id: true, status: true, priority: true }
    });
    if (!previous) return fail("Ticket not found", 404);
    const ticket = await prisma.supportTicket.update({
      where: { id: input.ticketId },
      data: { status: input.status, priority: input.priority },
      select: { id: true, status: true, priority: true, updatedAt: true }
    });
    await writeAuditLog({
      actor: admin, action: "support_ticket.reviewed", targetType: "SupportTicket",
      targetId: ticket.id, metadata: {
        priorStatus: previous.status,
        newStatus: ticket.status,
        priorPriority: previous.priority,
        newPriority: ticket.priority
      }
    });
    return ok({ ticket }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}
