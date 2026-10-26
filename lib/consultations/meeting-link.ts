import "server-only";

const allowedHosts = new Set([
  "meet.jit.si",
  "meet.google.com",
  "zoom.us",
  "us02web.zoom.us",
  "us04web.zoom.us",
  "us05web.zoom.us"
]);

// Meeting links are assigned by approved staff or the booking's astrologer.
// Never accept file:, javascript:, user-info, arbitrary subdomains or local URLs.
export function validateConsultationMeetingUrl(value: string): string | null {
  if (value.length > 600) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password ||
        parsed.port || !allowedHosts.has(parsed.hostname.toLowerCase()) ||
        parsed.pathname === "/" || !parsed.pathname || parsed.hash) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
export function readConsultationMeetingUrl(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const link = (value as Record<string, unknown>).meetingLink;
  return typeof link === "string" ? validateConsultationMeetingUrl(link) : null;
}
