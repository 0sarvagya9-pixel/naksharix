export type AnalyticsEventName =
  | "calculator_started"
  | "calculator_completed"
  | "report_cta_clicked"
  | "report_request_intent_reviewed"
  | "horoscope_selector_changed"
  | "contact_cta_clicked";

type AnalyticsMetadata = Record<string, string | number | boolean | undefined>;

const blockedMetadataKeys = new Set(["name", "email", "phone", "dateOfBirth", "dob", "timeOfBirth", "birthTime", "birthPlace", "question", "concern", "generatedText"]);

export function trackNaksharixEvent(eventName: AnalyticsEventName, metadata: AnalyticsMetadata = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;
  const safeMetadata = Object.fromEntries(Object.entries(metadata).filter(([key]) => !blockedMetadataKeys.has(key)));
  gtag("event", eventName, safeMetadata);
}
