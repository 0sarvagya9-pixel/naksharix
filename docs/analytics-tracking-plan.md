# Analytics Tracking Plan

## Current Status

Google Analytics loads only when `NEXT_PUBLIC_GA_ID` is configured. No sensitive astrology data should be sent to analytics.

## Safe Events

- `calculator_started`
- `calculator_completed`
- `report_cta_clicked`
- `report_request_intent_reviewed`
- `horoscope_selector_changed`
- `contact_cta_clicked`

## Privacy Rule

Never send name, DOB, birth time, birth place, phone, email, question text, or generated astrology output to analytics.

## Next Step

Add a small client event helper with allowlisted event names and non-sensitive metadata only.
