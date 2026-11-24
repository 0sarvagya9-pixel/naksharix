# Nashik–Trimbakeshwar Simhastha 2027 — seasonal Puja coordination

Source reviewed 24 November 2026:
- https://simhasthamahakumbh.maharashtra.gov.in/snan-calendar
- https://simhasthamahakumbh.maharashtra.gov.in/live-event-schedule

Main Mela: 15 June–30 September 2027. Wider Simhastha formally began on 31 October 2026 and ends on 24 July 2028. The promotional campaign covers the main 2027 Mela only. The seven Naksharix service request entries are independent Puja arrangements tied to those dates, not official Mela services, temple access, or Snan tickets. Exact ceremony times are not guaranteed. Recheck official notifications before confirming each Puja.

Lifecycle (Asia/Kolkata / IST):
- Campaign available from 24 November 2026, 00:00.
- New requests for each event close at 00:00 IST on that event's date; public information remains until the end of that day.
- All public campaign entries expire by 1 October 2027, 00:00 IST. No job or cron required: server-side timestamp filters and client refresh independently enforce the window. Historic bookings retain their IDs/names; no deletion of customer history.
- Regular Puja intake retains its 90-day limit. Only exact future event date/location can bypass that range. Existing owner approval, genuine verified partner, scheduled date, published fee, consent and payment safeguards remain required.
- Homepage promotional modal is first-party, dismissible, delayed five seconds, once per browser session; it is not an external advertising or tracking integration.
- Update the reviewed date registry in lib/puja/service-catalogue.ts if Maharashtra authorities revise their schedule. Do not invent muhurats. Keep existing historical bookings reconciled separately if a date changes.

Validation: qa:puja-directory tests exact IST boundaries for every event and final campaign expiry; qa-puja-coming-soon checks server admission, checkout guards, calendar and modal integration.
