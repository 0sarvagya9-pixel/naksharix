import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type Sender = "USER" | "ADMIN";
type AppendInput = {
  ticketId: string;
  sender: Sender;
  userId?: string;
  message: string;
  clientMutationId: string;
};
type Result =
  | { kind: "ok"; duplicate: boolean }
  | { kind: "not_found" | "closed" | "full" };

export async function appendSupportMessage(input: AppendInput): Promise<Result> {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.supportTicket.findUnique({
      where: { id: input.ticketId },
      select: { id: true, userId: true, status: true, messages: true }
    });
    if (!ticket || (input.sender === "USER" && ticket.userId !== input.userId)) {
      return { kind: "not_found" };
    }
    const previous = Array.isArray(ticket.messages) ? ticket.messages : [];
    if (previous.some((item) =>
      item && typeof item === "object" && !Array.isArray(item) &&
      "clientMutationId" in item && item.clientMutationId === input.clientMutationId
    )) return { kind: "ok", duplicate: true };
    if (ticket.status === "CLOSED" || ticket.status === "RESOLVED") return { kind: "closed" };
    if (previous.length >= 100) return { kind: "full" };

    await tx.supportTicket.update({
      where: { id: ticket.id },
      data: {
        messages: [...previous, {
          author: input.sender,
          text: input.message,
          at: new Date().toISOString(),
          clientMutationId: input.clientMutationId
        }] as Prisma.InputJsonArray
      }
    });
    return { kind: "ok", duplicate: false };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
