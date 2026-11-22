# NAKSHARIX — Puja safe launch and notification contract (22 Nov 2026)

**Owner instruction:** Keep all new Puja bookings and payments disabled while real Pandit
availability is not verified. No website button, catalog price, or operator checkbox
establishes a completed ceremony. Shop, Reports, AdSense and prior Puja history are not
part of this activation.

## Explicit launch switch and gates

- New flag: `PUJA_BOOKINGS_ENABLED`, defaults to `false`. DO NOT set true without
  written operator go-live acceptance. The legacy `PUJA_PAYMENTS_ENABLED` alone
  can never activate bookings.
- Existing one-merchant Razorpay keys must be valid, transactional email must be
  configured, and `ADMIN_EMAIL` must be a correct, controlled mailbox.
- A `PujaPartner` must have evidence URL, admin `VERIFIED` status, review timestamp
  **and an exact approved Puja topic ID in `traditions`**. A generic Hindu Puja
  declaration does not activate 94 unrelated rituals.
- A topic must be published in the authoritative `PujaOffering` table, with
  `available=true` and the currently supported canonical price **₹1,100**.
  This price must cover a real, agreed service scope; no claimed flat-price coverage
  of out-of-area materials, travel or special ceremonies without owner confirmation.
- Public `/pujas` and sitemap remain **Coming Soon/noindex** while any global gate
  is missing. An individual detail route also redirects unless the exact topic
  is eligible. Existing customer booking history is always readable.
- Admin diagnostics: `/admin/puja-launch-readiness` and
  `/api/admin/readiness` (admin-only). Never expose readiness/partner PII to public.

## Workflow and exact notifications

| Step | Operator action | Customer-visible status | Customer email | Admin email | Payment |
| --- | --- | --- | --- | --- | --- |
| 1. Request | Buyer submits topic, city, preferred date, private Sankalp | REQUESTED — date NOT reserved | Request accepted, Hindi + English, no payment due | New request needs Pandit coordination | Not offered |
| 2. Pandit acceptance | Operator contacts Pandit independently, checks exact rite/region, records factual note and attestation | CONFIRMED — no final time | Pandit acceptance recorded; scheduling still needed | Operator admin audit record | Not offered |
| 3. Date/time set | Admin records agreed future ISO time with offset, matching verified Pandit | SCHEDULED, date/time shown in Asia/Kolkata | Bilingual confirmation with date/time | Admin ledger | Only now, in My Puja Requests |
| 4. Payment captured | Buyer elects Razorpay, gateway verifies signature and captured status | Payment PAID; schedule persists | Payment verification with amount/ref, never ceremony-completed claim | Captured payment; fulfilment due | Exactly once with price/owner checks |
| 5. Ceremony begins | Admin checks captured payment and actual commencement | IN_PROGRESS | Status change; not proof of completion | Operator audit | No second charge |
| 6. Completed | Admin records real completion note (15+ chars) and optional evidence URL | COMPLETED | Status change and private status | Operator audit | No second charge |
| 7. Canceled/refunded | Cancel unpaid; paid cancellation requires reviewed refund path, signed FULL refund event | CANCELED / refunded payment history | Cancellation notice; separate confirmed PROCESSSED refund email after gateway event | Refund reconcile notification | No duplicate checkout |

All messages contain only limited identifiers and URLs into authenticated account.
Do not expose private Sankalp/gotra in email distribution. Emails marked
`accepted` mean the provider accepted the send API request, not that the
message landed in the inbox. Check real delivery separately before go-live.

**Pandit notification:** The current `PujaPartner` schema does not have a
verified partner email/phone channel. The owner/admin must contact the assigned
Pandit directly and record actual acceptance. Never claim a Pandit was notified
automatically, nor silently send private customer information to a third party.

## Payment and status protections

- `POST /api/puja/bookings` refuses requests unless global launch gates
  and exact-topic eligible price/partner exist. It rate-limits, verifies price
  against authoritative server record, deduplicates active same-day requests, and
  creates REQUESTED **without** collecting money.
- Admin cannot advance to CONFIRMED/SCHEDULED without real Pandit, explicit
  acceptance checkbox and admin note. Scheduling requires a future time.
- `POST /api/payments/razorpay/order` verifies buyer ownership, status
  SCHEDULED, matching active ₹1,100 offering, exact Pandit/topic, and future time.
- Gateway capture never upgrades a booking to CONFIRMED automatically. Status
  comes from independently recorded admin acceptance and scheduling.
- Payment and signed full-refund webhooks are idempotently reconciled in existing
  payment ledger; notifications use stable per-event idempotency keys.
- Cancellations after paid capture must use verified refund handling. Do not
  mark ceremonial delivery completed merely because payment succeeded.

## Release acceptance to complete BEFORE flip

1. Verify actual Pandit identity, language, discipline, exact Puja, regional reach,
   agreed date availability, samagri, mode (online/in-person), honorarium and
   cancellation/refund terms. Obtain partner's consent for any contact/media sharing.
2. Confirm identity-proof evidence corresponds to that Pandit, not just a website URL.
3. Run isolated DB test: duplicate/invalid request, missing partner, wrong topic,
   expired schedule, stale fee, wrong user, canceled request, premature payment,
   duplicate capture and signed refund. New launch flag defaults false.
4. Verify real inbox delivery to buyer and admin, plus separate Pandit manual
   acceptance, with customer-safe Hindi/English status copy.
5. Test a real customer payment, reconciliation, merchant settlement and refund
   with explicit owner approval. Do not change keys or perform a real charge
   automatically during QA.
6. Confirm `/pujas` index/noindex, homepage and calendar copy, My Puja Requests,
   one merchant Razorpay, and no regression in Shop/Reports or current AdSense review.
7. Only after documented review set `PUJA_BOOKINGS_ENABLED=true` in
   production. Start with 1–2 truly supported offerings, not the whole directory.

**Roll-back:** Set `PUJA_BOOKINGS_ENABLED=false`. This immediately disables
new intake and Puja checkout; existing history, customer status and genuine
captured payments must remain available for support/refund reconciliation.
