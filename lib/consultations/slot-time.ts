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

/** Shared IST day range, independent of browser/server timezone; end is exclusive. */
export function consultationDayBounds(now = new Date()) {
  if (!Number.isFinite(now.getTime())) throw new RangeError("Invalid consultation date");
  const offset = 330 * 60000;
  const start = new Date(Math.floor((now.getTime() + offset) / 86400000) * 86400000 - offset);
  return { start, end: new Date(start.getTime() + 86400000) };
}

/** A datetime-local field in this portal is explicitly an IST civil time. */
export function parseConsultationLocalDateTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  return parseConsultationSlotTime(value.slice(0, 10), value.slice(11));
}
