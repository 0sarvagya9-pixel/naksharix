export const analyticsEventNames = ["page_view", "cta_link", "calculator_started", "calculator_completed", "report_cta_clicked", "report_request_intent_reviewed", "horoscope_selector_changed", "contact_cta_clicked"] as const;
export type AggregateEventName = typeof analyticsEventNames[number];
export const analyticsConsentKey = "naksharix-analytics-consent-v1";
const publicPaths = new Set(["/","/hi","/kundli","/free-kundli","/kundli-matching","/matchmaking","/panchang","/numerology","/tarot","/horoscope","/daily-horoscope","/weekly-horoscope","/monthly-horoscope","/yearly-horoscope","/yearly-horoscope-2027","/hi/yearly-horoscope-2027","/festival-calendar","/hi/festival-calendar","/kumbh-mela-2027","/hi/kumbh-mela-2027","/grahan-2027","/hi/grahan-2027","/hi/about","/hi/free-kundli","/hi/kundli-milan","/reports","/shop","/pujas","/puja-calendar","/consultation","/astrologers","/learn","/blog","/pricing","/about","/contact","/faq","/privacy-policy","/terms-and-conditions","/refund-policy","/delivery-policy","/free-calculators"]);
export function publicAnalyticsRoute(value: string): string | null {
  if(value.length>180 || value.includes('?') || value.includes('#') || value.includes('%'))return null;
  if(publicPaths.has(value))return value;
  for(const prefix of ['/shop/','/pujas/','/reports/','/blog/','/horoscope/','/free-calculators/','/learn/','/zodiac/'])
    if(value.startsWith(prefix) && /^[a-z0-9/-]+$/.test(value.slice(1)))return prefix+':public-page';
  return null;
}
