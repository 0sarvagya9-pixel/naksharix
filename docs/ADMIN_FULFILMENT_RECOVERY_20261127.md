# Admin fulfilment recovery — 27 November 2026

## Checkpoint and defects reproduced

The recovery started from immutable commit `15784f59e61b0a3da9a1b924e651b2ee1abbb2a3`. The previous temporary workspace and its unpublished results were not used as evidence.

`FULFILMENT_UI_BASELINE=15784f5 node scripts/qa-admin-fulfilment-ui.mjs` executes the old Shop component in Chromium. It reproduced both a saved-success message after an acknowledgement for the wrong order ID and two PATCH requests from two same-turn form submissions.

The consultations page also caught a failed database read as an empty list. The page now passes an explicit availability flag; an unavailable read no longer claims there are no bookings.

## Completed implementation

The actual Shop, Puja and consultation admin components now use explicit English, Hindi and Hinglish control, state, recovery and error copy. Their private page titles follow the saved language cookie. Existing administrator role gates and private robots metadata remain in place. Operational dates use Asia/Kolkata. An international quote entered as 16:00 IST is sent as 10:30 UTC even if the operator's browser is in America/Los_Angeles.

Shop and Puja saves require the returned record to match the submitted identity, next version, status, preserved ownership and price, and the fields actually being changed. Shop quote acknowledgements also match carrier, expiry, duties and paise. Consultation acknowledgements must match the booking, status, payment status, meeting link and note, and include a newer persisted timestamp. A successful HTTP code with missing or mismatched evidence cannot create a success message.

A synchronous ref prevents duplicate same-turn saves or notification retries. During an uncertain mutation result, another mutation is disabled until an explicit verified refresh. Pending old GET responses cannot replace a newer save or a newer GET response. An invalid registry response is shown as unavailable, not as an empty list. No mutation is silently repeated after a network failure.

Shop quote approval is reset when the amount, carrier, evidence, expiry or duties changes. Its inputs can be completed before the operator explicitly confirms them. An existing valid international quote does not force a fresh quote just to edit an owner note. Puja acceptance is reset if the status, partner or ceremony time changes. These are UI assertions for an authorized human operator; the application does not manufacture supplier or Pandit acceptance.

The fulfilment notification retry response now includes the exact kind, record ID, version and status already claimed by the server. The UI verifies that identity before reporting the attempt. Provider acceptance continues to be described as provider acceptance; inbox placement is not claimed.

## Preserved server constraints

The original Shop and Puja mutation routes retain their authenticated administrator gates, allowed transitions, version compare-and-swap, transaction behavior and audit records. Paid Shop charges cannot be changed and packing/dispatch require a verified captured payment. International quote evidence, expiry, customs terms and outstanding-payment checks remain in place. Puja still requires an admin-verified partner with the exact topic capability, actual acceptance assertion, appropriate date and captured payment for execution/completion. Paid cancellation/reassignment restrictions remain unchanged.

The notification retry endpoint retains its record-version binding, advisory lock, two-attempt hourly budget, fixed account recipient and status-only audit. The only route change is the additive acknowledgement identity.

The consultation endpoint's administrator authorization, allowlisted HTTPS meeting-link validation and privileged recorded-payment editing policy remain in place. A follow-up race probe on `836629f` demonstrated that two administrators editing the same snapshot both received HTTP 200 and the second replaced the first note. The endpoint now requires the existing `updatedAt` timestamp, compares it atomically with the current status/payment state, and persists the mutation and audit in one transaction. Exactly one same-snapshot write can succeed; a stale one receives HTTP 409. The timestamp advances at least one millisecond, including same-clock-tick saves, and the client retains the returned timestamp for its next edit. No schema migration is required.

Shop/Puja status emails now select the recipient's saved `user.locale`. All eleven existing notifiable statuses have English, Hindi and Hinglish subjects, status explanations, private account links, appropriate IST schedule text and payment/proof/privacy language. Existing English/Hindi Puja notices are reused to preserve their meaning. Missing or unrecognized saved locale falls back to English. Notification outcomes, existing fixed recipients, push behavior and no-change suppression are preserved; no real email was sent during verification.

## Fresh verification

| Gate | Observed result | Scope |
| --- | --- | --- |
| `qa-admin-fulfilment-ui.mjs` | **183 passed** | Actual three admin components, response readers, language provider and shipping/shortlist helpers in Chromium, three locales. Includes duplicate submissions, invalid acknowledgements, status/network errors, notification identity/outcomes, unknown-vs-empty, stale GET after save, out-of-order GETs, approval reset, note-only international edits, consultation timestamp acknowledgements and IST handling. |
| `qa-admin-fulfilment-contracts.mjs` | **70 passed** | **56** actual HTTP handler/schema/rule/response checks and **14** actual private page/locale/role/availability checks. |
| Baseline defect probe | Both reproduced | Wrong-order saved-success and duplicate Shop PATCHes on immutable `15784f5`. |
| `qa-consultation-admin-concurrency.mjs` | **13 passed** | Actual route/schema with isolated persistence and transaction adapter; same-snapshot race, intervening payment, stale retry, fresh-snapshot follow-up, role/link/schema and monotonic timestamp. Baseline `836629f` reproduced the two-write overwrite. |
| `qa-fulfilment-locale-email.mjs` | **59 passed** | Actual notification worker and templates through intercepted database/email/push transports; eleven statuses in three locales, saved-locale fallback, provider outcomes, fixed recipient, privacy and no-change suppression. |
| `qa-nonpayment-operations.mjs` | Passed | Existing source contract updated to follow the actual localized notification dictionary and response readers. |
| `qa-predeploy-commerce.mjs` | Passed | Existing commerce source guard. |
| `qa-puja-offerings.mjs` | Passed | Existing Puja offering/source guard. |
| Targeted ESLint | Passed | Touched fulfilment source and test scripts. |
| Full TypeScript check | Passed | `tsc --noEmit`. |

The Chromium harness uses synthetic fixtures and intercepts all network requests. The Node harness executes the actual route handlers, Zod schemas, quote/partner/meeting rules, response readers and page wrappers, with isolated identity, in-memory persistence, transaction adapter and notification transport. It does not certify real PostgreSQL concurrency, Razorpay payment capture, courier/partner verification, live scheduling or real inbox delivery. The preserved Shop/Puja compare-and-swap conditions are exercised through the isolated adapter; the production database still needs its own operational acceptance evidence.

No genuine email, approval, order, Puja booking, payment, refund, customer record or production resource was changed by these checks. These fresh 325 scoped checks (183 + 70 + 13 + 59) do not replace the original commercial requirements register or independently certify language quality.

## Known boundaries for the next review

- Consultation concurrency checks execute the real handler with an isolated atomic-update/transaction adapter. Production PostgreSQL isolation, deployment rollout and live webhook behavior are not certified by this isolated test. Older open admin tabs without the required snapshot timestamp must refresh before saving.
- Shop/Puja and support reply email content now follows the customer's saved language. Independent native-language review remains a separate acceptance criterion.
- Real provider readiness, reviewed shipping evidence, Pandit availability/acceptance, payment reconciliation, inbox delivery and independent language review remain evidence-dependent work. Passing these isolated engineering gates does not satisfy those external criteria.

## Reproduce

Use an installed Playwright Chromium matching the project's test environment and set `PLAYWRIGHT_BROWSERS_PATH` when it is outside the default cache.

```sh
node scripts/qa-admin-fulfilment-ui.mjs
node scripts/qa-admin-fulfilment-contracts.mjs
node scripts/qa-consultation-admin-concurrency.mjs
node scripts/qa-fulfilment-locale-email.mjs
CONSULTATION_ADMIN_BASELINE=836629f node scripts/qa-consultation-admin-concurrency.mjs
FULFILMENT_UI_BASELINE=15784f5 node scripts/qa-admin-fulfilment-ui.mjs
node scripts/qa-nonpayment-operations.mjs
node scripts/qa-predeploy-commerce.mjs
node scripts/qa-puja-offerings.mjs
npx tsc --noEmit
```
