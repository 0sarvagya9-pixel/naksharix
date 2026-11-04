/** Shared presentation policy. Server authorization/payment checks remain authoritative. */
export type BookingAction = "ACCEPT" | "REJECT" | "COMPLETE" | "RESCHEDULE";
const mutable = new Set(["PENDING", "REQUESTED", "PAYMENT_PENDING", "ACCEPTED", "CONFIRMED"]);
const eligible = new Set(["PAID", "FREE", "ADMIN_BYPASS"]);

export function availableBookingActions(status?: string, paymentStatus?: string): BookingAction[] {
  // Older callers without a snapshot still get server-validated controls.
  if (status === undefined) return ["ACCEPT", "REJECT", "COMPLETE", "RESCHEDULE"];
  if (!mutable.has(status)) return [];
  if (paymentStatus !== undefined && !eligible.has(paymentStatus)) return ["REJECT"];
  return status === "ACCEPTED" || status === "CONFIRMED"
    ? ["REJECT", "COMPLETE", "RESCHEDULE"] : ["ACCEPT", "REJECT", "RESCHEDULE"];
}

export function consultationIntervalsOverlap(a: Date, aMinutes: number, b: Date, bMinutes: number) {
  if (![a.getTime(), b.getTime(), aMinutes, bMinutes].every(Number.isFinite) || aMinutes <= 0 || bMinutes <= 0)
    throw new RangeError("Invalid consultation interval");
  return a.getTime() < b.getTime() + bMinutes * 60000 && b.getTime() < a.getTime() + aMinutes * 60000;
}
