# Consultation request accessibility and payment recovery — 2026-11-26

## Defects reproduced

The existing consultation request form did not associate visible labels with their input controls. Its booking, payment and processing messages were English-only even when Hindi or Hinglish was selected. A malformed successful order response could throw while destructuring `orderJson.data`, leaving the form in a loading state. Payment verification accepted any HTTP 200 response instead of checking the acknowledged payment's purpose, order, identity, amount and paid status. A React state update alone did not prevent two synchronous submits from creating duplicate booking requests.

The regression harness loads the actual React consultation component with its real input components, language dictionaries and payment acknowledgement validators. At baseline `9b84a0d`, the first label association assertion fails. Additional malformed-response and repeated-callback cases exercise the repaired flow.

## Source changes and preserved contracts

- Added localized English, Hindi and Hinglish booking messages, payment statuses, slot types, price labels and recovery links. Status is stored as a message key, so changing the selected language also changes the displayed status.
- Bound each visible field label to a unique control ID; required fields use native required/minimum/maximum constraints matching the existing server limits. Field errors identify the affected control through `aria-invalid` and `aria-describedby`; asynchronous status uses a polite live region.
- Validate the saved booking identity and expected price, and reuse the existing shared checkout-order and verified-payment acknowledgement validators. A successful HTTP status alone cannot produce a paid confirmation.
- Use synchronous guards against duplicate submits and duplicate provider verification callbacks. Once a booking exists, or its response is uncertain, recover through the saved booking or the existing bookings/payment-history pages. The form does not create a second booking to recover an uncertain payment.
- Handle missing, malformed and mismatched booking/order/verification responses and SDK construction failures without leaving loading active or navigating to a false success.

The API paths, submitted booking fields, payment-purpose/order payload and provider verification payload are unchanged. No payment backend, provider setting, price, practitioner record or external integration was changed.

## Verification

Command:

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/scratch/f1fce8ed7944/runtime-scratch/playwright-browsers node scripts/qa-consultation-request-ui.mjs
```

Result: **48 scenarios passed in Chromium across three locales, including 24 visible-label checks.** Cases include required-field error semantics, malformed order payloads and wrong currency/amount, SDK construction failure, malformed or mismatched verification acknowledgements, incorrect callback order, exact successful acknowledgement, incomplete booking response, slot conflict and lost booking response. Two same-turn submits create one request; duplicate provider callbacks verify at most once. No browser page errors were observed.

Baseline command adds `CONSULTATION_UI_BASELINE=9b84a0d` and fails the label association assertion, as expected. Focused ESLint and full `tsc --noEmit --incremental false` passed. Existing report-preflight and checkout-acknowledgement contracts passed; booking reliability passed **10/10** and consultation IST boundary checks passed **11/11**.

The existing `browser-audit` CI job runs this regression after installing its isolated Playwright tools and verifying the image's browser cache. It reuses the job's Playwright 1.54.1, installed TypeScript and React 18 dependencies; it does not add an application dependency or require the application server/database. `set -euo pipefail` preserves a failed regression exit status through `tee`, and the existing always-run browser evidence upload includes `consultation-request-ui.log`. The three existing browser projects and their gates are unchanged.

## Acceptance boundary

The browser harness isolates routing, transport and the Razorpay SDK and blocks external network requests. It proves the component's behavior and acknowledgement checks, not a real payment, provider webhook, delivered consultation or practitioner acceptance. It does not qualify the rest of the site's language/accessibility surface or advance full A44 commercial acceptance. Real provider, inbox, merchant, practitioner and independent review gates remain unchanged.
