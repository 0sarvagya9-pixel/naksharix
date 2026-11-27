export type SupportTicket = {
  id: string; subject: string; status: string; priority: string; createdAt: string; messages: unknown;
  user?: { id: string; email: string; name: string | null };
};
export const supportStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
export const supportPriorities = ["LOW", "NORMAL", "HIGH"] as const;
export const supportObject = (value: unknown): Record<string, unknown> | null => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const date = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));

function isTicket(value: unknown, admin: boolean): value is SupportTicket {
  const ticket = supportObject(value);
  if (!ticket || !text(ticket.id) || !text(ticket.subject) || !supportStatuses.includes(ticket.status as typeof supportStatuses[number]) || !supportPriorities.includes(ticket.priority as typeof supportPriorities[number]) || !date(ticket.createdAt) || !Array.isArray(ticket.messages)) return false;
  if (!admin) return true;
  const user = supportObject(ticket.user);
  return !!user && text(user.id) && text(user.email) && (user.name === null || typeof user.name === "string");
}
export function readSupportTickets(value: unknown, admin = false): SupportTicket[] | null {
  const list = supportObject(supportObject(value)?.data)?.tickets;
  return Array.isArray(list) && list.every(ticket => isTicket(ticket, admin)) ? list as SupportTicket[] : null;
}
export function createdSupportTicket(value: unknown, intent: { id: string; subject: string; message: string }): SupportTicket | null {
  const data = supportObject(supportObject(value)?.data);
  const ticket = data?.ticket;
  if (!data || data.clientMutationId !== intent.id || typeof data.duplicate !== "boolean" || !isTicket(ticket, false) || ticket.subject !== intent.subject) return null;
  const first = Array.isArray(ticket.messages) ? supportObject(ticket.messages[0]) : null;
  return first?.author === "USER" && first.text === intent.message ? ticket : null;
}
export function supportReplyRecorded(value: unknown, intent: { id: string; ticketId: string }): boolean {
  const data = supportObject(supportObject(value)?.data);
  return !!data && data.recorded === true && data.clientMutationId === intent.id && data.ticketId === intent.ticketId && typeof data.duplicate === "boolean";
}
export function supportReviewRecorded(value: unknown, expected: { id: string; status: string; priority: string }): boolean {
  const ticket = supportObject(supportObject(supportObject(value)?.data)?.ticket);
  return !!ticket && ticket.id === expected.id && ticket.status === expected.status && ticket.priority === expected.priority && date(ticket.updatedAt);
}
