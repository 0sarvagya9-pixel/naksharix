# NAKSHARIX — 15/15 Premium Report Price Closure (3 Nov 2026)

## Scope and customer promise
All 15 public `/reports` catalogue entries have explicit, server-owned **one-time INR prices** and a single existing Razorpay merchant checkout path. These are personalized/manual-review reports, not instant guaranteed results. Payment verification is a prerequisite for submitting the secure birth-details request, and a PDF download is only shown when an actual PDF exists. Existing 6 published report amounts remain unchanged. No new account, payment gateway, inventory or automated delivery promise is introduced.

## Final public price table

| Report | One-time total INR |
| --- | ---: |
| Premium Personalized Kundli | ₹799 |
| Couple Kundli / Match Making | ₹699 |
| Career | ₹599 |
| Wealth | ₹599 |
| Love / Relationship | ₹499 |
| Baby Name | ₹399 |
| Sade Sati | ₹399 |
| Manglik / Kaal Sarp | ₹499 |
| Numerology + Lo Shu | ₹399 |
| Name Correction | ₹399 |
| Yearly Horoscope | ₹999 |
| Transit | ₹449 |
| Rahu Ketu | ₹399 |
| Jupiter Transit | ₹399 |
| Fortune | ₹499 |

These are merchant-selected published fees for manual reporting work; they are **not** claims that competitors charge identical prices.

## Public market references checked 2026-11-03
- KundliReports, pricing dated 2026-10-11, shows 12-month transit ₹449, Sade Sati ₹349, Jupiter transit ₹299 and Baby Name ₹549: https://kundlireports.com/pricing/
- GuruShakti public report catalogue shows Manglik ₹499, Kaal Sarp ₹499 and Sade Sati ₹499: https://gurushakti.in/
- Divine Hindu report catalogue displays focused personalized reports at ₹298 total: https://www.divinehindu.in/pages/reports
- These providers have different report lengths, preparation methods and fulfillment SLAs. Prices are directional market checks, not feature/quality equivalence or evidence of customer acceptance.

## Server contract and safety
- `lib/paid-reports.ts`: canonical numeric fee and item ID.
- `lib/reports/checkout-catalogue.ts`: complete 15-slug to 15-distinct-paid-ID mapping.
- `/api/payments/razorpay/order`: gateway order uses server-owned canonical amount and purpose.
- `/api/payments/razorpay/verify`: cryptographic signature and captured-gateway-status validation.
- `/report-request/new` and `/api/report-requests`: same-user, exact-report-ID, exact-amount and PAID-status gate before storing paid request.
- No customer report is marked delivered before actual generated PDF/storage and admin delivery action.
- Browser and integration QA are required; an actual captured real-money test, settlement to merchant bank, refund, paid email delivery and admin fulfillment still need independent external acceptance. Do not call any of these passed merely because code checks pass.

## Acceptance
`npm run qa:reports-complete-pricing`, `npm run qa:reports-workflow`, full `qa:all`, lint, typecheck, build, dependency audit, browser QA and production HTTPS smoke. Observe correct public price and authentication boundary without initiating an actual payment.
