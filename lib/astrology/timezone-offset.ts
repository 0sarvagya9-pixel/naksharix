/**
 * Resolve a location's UTC offset for the selected civil date, not the
 * developer's fixed standard/summer offset. This is essential for foreign
 * Panchang presets across daylight saving transitions.
 */
export function timezoneOffsetForDate(isoDate: string, zone: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) throw new Error("Invalid calendar date");
  const instant = new Date(isoDate + "T12:00:00.000Z");
  if (!Number.isFinite(instant.getTime())) throw new Error("Invalid calendar date");
  const timezoneName = new Intl.DateTimeFormat("en-US", {
    timeZone: zone, timeZoneName: "longOffset"
  }).formatToParts(instant).find(item => item.type === "timeZoneName")?.value ?? "";
  if (timezoneName === "GMT" || timezoneName === "UTC") return "+00:00";
  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(timezoneName);
  if (!match) throw new Error("Cannot resolve timezone offset");
  return match[1] + match[2].padStart(2, "0") + ":" + (match[3] ?? "00");
}

export function todayInTimezone(zone: string, clock: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone, day: "2-digit", month: "2-digit", year: "numeric"
  }).formatToParts(clock);
  const value = Object.fromEntries(parts.map(piece => [piece.type, piece.value]));
  return value.year + "-" + value.month + "-" + value.day;
}
