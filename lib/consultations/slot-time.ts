/** Public booking slots are entered and displayed in India Standard Time. */
export const CONSULTATION_TIME_ZONE = "Asia/Kolkata";

/** Return the UTC instant of a civil date/time in IST, never server-local time. */
export function parseConsultationSlotTime(bookingDate: string, startTime: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) return null;
  const civilDay = new Date(`${bookingDate}T12:00:00.000Z`);
  if (Number.isNaN(civilDay.getTime()) || civilDay.toISOString().slice(0, 10) !== bookingDate) return null;
  const instant = new Date(`${bookingDate}T${startTime}:00+05:30`);
  return Number.isNaN(instant.getTime()) ? null : instant;
}

/** Weekday of the entered Indian civil date, unaffected by the UTC offset. */
export function consultationSlotWeekday(bookingDate: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) return null;
  const civilDay = new Date(`${bookingDate}T12:00:00.000Z`);
  if (Number.isNaN(civilDay.getTime()) || civilDay.toISOString().slice(0, 10) !== bookingDate) return null;
  return civilDay.getUTCDay();
}

export function formatConsultationSlotTime(scheduledAt: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: CONSULTATION_TIME_ZONE
  }).format(scheduledAt);
}
