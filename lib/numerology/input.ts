/** A birth date is a civil date. Reject rollover before any Date coercion
 * can erase an invalid day such as 1990-02-30. Date objects use their UTC date. */
export function normalizeNumerologyBirthDate(value: string | Date): Date {
  const text = value instanceof Date
    ? Number.isFinite(value.getTime()) ? value.toISOString().slice(0, 10) : ""
    : typeof value === "string" ? value : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error("Invalid date of birth");
  const date = new Date(text + "T00:00:00.000Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
    throw new Error("Invalid date of birth");
  }
  return date;
}

export function isNumerologyBirthDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try { normalizeNumerologyBirthDate(value); return true; } catch { return false; }
}

export function isNumerologyMobile(value: unknown): value is string {
  return typeof value === "string" && /^\+?[0-9\s-]{7,20}$/.test(value.trim()) && /[1-9]/.test(value);
}

export function isNumerologyVehicle(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9\s-]{2,20}$/.test(value.trim()) && /[A-Za-z1-9]/.test(value);
}
