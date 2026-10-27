# Rolling Hindu Puja Calendar — GitHub predeploy handoff (2026-10-27)

Scope: 58 curated major observances for India, dates reviewed from the public 2026–2028 Drik Panchang Indian calendars and cross-checked for selected festivals against public festival sources.

Source references:
- https://www.drikpanchang.com/calendars/indian/indiancalendar.html?lang=en&year=2026
- https://www.drikpanchang.com/calendars/indian/indiancalendar.html?lang=en&year=2027
- https://www.drikpanchang.com/calendars/indian/indiancalendar.html?lang=en&year=2028

Source-backed dates are facts; this implementation does not republish third-party images or original product descriptions.

Runtime: `nextTwoYearsPujaCalendar()` derives date from Asia/Kolkata per request and selects reviewed reference dates until an exclusive same calendar date two years ahead. Read-only GET `/api/puja/calendar`, new `/puja-calendar` page, navigation, Puja enquiry journey and sitemap. No DB writes and no Vercel deployment performed.

Nonclaims: this covers selected mainstream observances, NOT all regional festivals, every Ekadashi, every Purnima, local tithi or muhurat. Calendar must be expanded with verified 2029+ data rather than simply moving Gregorian festival dates. For critical service scheduling verify city, sunrise, observance tradition, temple priest capacity, required materials and customer confirmation.

Commerce: listings are information-only. No paid Puja reservation, Razorpay activation, refund or provider fulfillment is implied. Existing payment/checkout, report generator and shop-safety boundaries are unchanged. Production remains HOLD until comprehensive acceptance.

Acceptance: `npm run qa:puja-calendar` and full CI exact-SHA success, then 24-month window and mobile browser user journeys, production backups and live service verification before any deployment.