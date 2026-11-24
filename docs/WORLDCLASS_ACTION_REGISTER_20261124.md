# World-class development scope and release gate

Owner instruction: do not deploy until explicitly authorized. This register distinguishes source changes from verified completion. SOURCE = relevant source implementation staged but not yet qualified. PARTIAL = some implementation only. OPEN = work not closed. EXTERNAL = actual outside evidence/approval/provider/merchant/fulfilment is needed. POST_APPROVAL = real live acceptance deferred. EXISTING = existing product, not proof of this release or revenue. No item marked fully verified on the development branch.

## Audit action register (52)

| ID | Scope | State | Remaining acceptance / implementation |
|---|---|---|---|
| 01 | Production backup receipt | PARTIAL | Staged receipt time/schema/key/size and private archive existence checks plus 36h cross-midnight lookup. Actual missing receipt/root cause and verified restore remain unresolved; no production mutation during hold. |
| 02 | Shubh Muhurat | SOURCE | Computed Delhi Abhijit and Panchang, explicit local reference; compare authoritative fixtures. |
| 03 | Core calculators | SOURCE | Replace seeded planetary signs with computed chart provider, timezone and location; test name invariance. |
| 04 | Legacy matching API | SOURCE | Real chart-based Ashtakoot; verify legacy contract and eight factors. |
| 05 | Historical paid Puja | EXTERNAL | Read-only merchant and order evidence reconciliation; no invented partner or scheduled time. |
| 06 | Google callback role mutation | SOURCE | GET read-only, explicit authenticated CSRF POST, verified email and atomic role/profile mutation. |
| 07 | Password recovery | SOURCE | One-time HMAC reset, expiry, quotas and session invalidation; verify actual email receipt and race cases. |
| 08 | Password visibility | SOURCE | Accessible password visibility/autocomplete on auth and reset forms. |
| 09 | OTP checkout return | SOURCE | Preserve sanitized destination through verification; test end-to-end. |
| 10 | Google redirect | SOURCE | Handle safe next destination; verify provider callback and registration. |
| 11 | Professional signup | SOURCE | Explicit professional role query preselection. |
| 12 | Unverified accounts | PARTIAL | Localized OTP, accurate non-enumerating delivery messaging and private aggregate onboarding counts staged. Actual mailbox receipt and customer conversion remain unverified. |
| 13 | Authentication heading semantics | SOURCE | Primary H1 semantics; verify keyboard and screen-reader behavior. |
| 14 | Auth translations | PARTIAL | OTP form complete EN/HI/Hinglish key-based messages and accessible status/error announcements; reset and full server/role/email localization still require review. |
| 15 | Stale report orders | SOURCE | Exact merchant-order recovery and serialized reservation; unknown/partial/refunded states fail closed; independent gateway tests pending. |
| 16 | Validate before payment | SOURCE | Direct fixed-price report server preflight, signed eligibility claim, same-page paid detail submission; verify all entry points and legacy compatibility. |
| 17 | Differentiated report benefits | SOURCE | Integrated PR153, catalogue and detail copy backed by actual report renderer. |
| 18 | Report comparison | SOURCE | Compare up to three actual priced catalogue entries; verify accessibility and mobile. |
| 19 | Sample PDF | SOURCE | Actual renderer-based fictional sample generation for 15 supported reports; outputs not rendered/inspected yet. |
| 20 | Live report delivery | POST_APPROVAL | Real purchase-to-delivery, email, retry, download and permission acceptance require explicit approval. |
| 21 | Independent astrology accuracy | OPEN | Cross-check real ephemerides and reference charts; do not claim certification. |
| 22 | 2027 horoscope | SOURCE | Added 12 calculated reference snapshots, sign-relative monthly themes, EN/HI pages, year-aware web/mobile API and QA fixtures. Existing paid report remains rolling twelve months. Independent ephemeris and full acceptance remain pending. |
| 23 | Astrologer approvals | EXTERNAL | Genuine credential review and provider availability needed. |
| 24 | Verified Pandit | EXTERNAL | Actual partner due diligence and acceptance. |
| 25 | Pending Puja requests | EXTERNAL | Operator and partner confirmation with genuine scheduling; preserve historical records. |
| 26 | Paid Puja activation | EXTERNAL | Existing launch gates remain; real fulfilment readiness and authorization needed. |
| 27 | Consultation availability | EXTERNAL | Genuine approved practitioners and bookable slots. |
| 28 | Shop fulfilment | EXTERNAL | Actual supplier, inventory, shipping, payment and tracking evidence. |
| 29 | Push notifications | SOURCE | Default-off opt-in device registration, encrypted endpoints, strict HTTPS push-service allowlist, RFC 8292 VAPID payloadless delivery, real report/Puja/shop status hooks, provider-outcome dedupe, revoke and logout controls, additive migration and QA. Actual key configuration and device/provider delivery acceptance pending. |
| 30 | Google homepage canonical | EXTERNAL | Technical canonical live before hold; Google recrawl/index decision outside direct control. |
| 31 | Report index coverage | EXTERNAL | Confirm index coverage through Search Console and improve actual content if needed. |
| 32 | Panchang and matching indexing | EXTERNAL | Search engine indexing evidence; no guaranteed ranking. |
| 33 | Seasonal indexing | EXTERNAL | Search Console recrawl of deployed seasonal routes. |
| 34 | Hindi About indexing | EXTERNAL | Search engine discovery/index confirmation. |
| 35 | Genuine backlinks | EXTERNAL | Earn independently published editorial links; no outreach launch during hold. |
| 36 | AI citations | EXTERNAL | Independently observe actual citations; no fabricated metrics. |
| 37 | GA4 data | PARTIAL | Added missing seasonal/yearly public route categories and privacy-safe accepted/failed/unknown transport counters in private Operations; real GA4 reporting and consent/browser acceptance pending. No synthetic events. |
| 38 | Durable marketing consent | SOURCE | Integrated PR151 schema, additive migration source, verified opt-in/withdrawal; migration and suppression acceptance pending. |
| 39 | Opt-in acquisition / partnership | SOURCE | Integrated PR144 private authenticated partner enquiries and public resources; consent operations pending. |
| 40 | Homepage conversion UI | SOURCE | Added direct reports, Puja request, and practitioner availability links while retaining approved hero and services; visual/mobile acceptance pending. |
| 41 | Mobile popup behavior | PARTIAL | Native modal retains existing collision/session guards; restored focus and added description and overscroll containment. Physical-device and keyboard acceptance pending. |
| 42 | Report UI | SOURCE | Comparison, samples, benefits, mobile cards and sticky mobile review CTA linked to original checkout; responsive acceptance pending. |
| 43 | Unified authentication UI | PARTIAL | Recovery, redirect and role UX improved; unified layout and complete interaction polish pending. |
| 44 | Language consistency | OPEN | Complete EN/HI/Hinglish across forms, checkout, account and PDFs. |
| 45 | International experience | PARTIAL | Explicit IANA/DST and offset calculation repair; global birthplace, international merchant and currency acceptance remain. |
| 46 | Monitoring | PARTIAL | Durable low-cardinality framework-error and external transport receipt counters, private seven-day admin evidence panel. Actual provider, alert receipt and incident acceptance remain pending. |
| 47 | Scalability | PARTIAL | Durable atomic rolling-window database counters for core quota fallback and payment/report critical routes; trusted forwarded client identity, HMAC storage, bounded retention and fail-closed critical behavior. Paid AI ledger also serialized. Remaining route coverage, concurrent database tests and load qualification pending. |
| 48 | Admin acceptance | POST_APPROVAL | Added private live read-only aggregate reconciliation panel for paid Puja anomalies, report requests, onboarding and unpaid shop orders; actual admin workflows, refunds and mobile UI require final acceptance. |
| 49 | Professional dashboard and payout | PARTIAL | Secure explicit professional application; full schedule, session, earnings and payout acceptance requires real approved provider. |
| 50 | Real payment lifecycle | POST_APPROVAL | Actual authorized test charge, invoice, capture, recovery and refund evidence. |
| 51 | Real devices and slow network | POST_APPROVAL | Physical-device acceptance and network tests. |
| 52 | Independent accessibility | PARTIAL | Added auth error associations/announcements, selected-role ARIA state, OTP live messages and native dialog focus handling; independent keyboard/screen reader/contrast acceptance remains. |

## Revenue capability register (35)

| ID | Scope | State | Remaining acceptance / implementation |
|---|---|---|---|
| 01 | Premium Kundli | EXISTING | Existing SKU; verify full delivery and actual sample. |
| 02 | Couple matching | EXISTING | Existing SKU; real matching and permission checks. |
| 03 | Career report | EXISTING | Existing SKU; differentiated content. |
| 04 | Numerology / Lo Shu | EXISTING | Existing SKU; independently validate calculations. |
| 05 | Baby name | EXISTING | Existing SKU; name suggestions and limitations. |
| 06 | Business name numerology | OPEN | Dedicated business-name report scope, engine output and merchant-approved SKU. |
| 07 | Yearly 2027 | SOURCE | Rolling 12-month paid SKU preserved; actual calculated educational 2027 guide and year-aware APIs staged. No claimed prediction or externally certified ingress timing. |
| 08 | Complete Life bundle | OPEN | Real component fulfilment, quantity, per-component ledger and approved price. |
| 09 | Family package | OPEN | Per-person consent, input and distinct private report delivery. |
| 10 | Marriage planning | OPEN | Real couple report + optional approved consultation; itemized availability and price. |
| 11 | Human reviewed add-on | OPEN | Verified reviewer, workflow and truthful review evidence. |
| 12 | AI credits | SOURCE | Dedicated default-off one-time response packs, approved model/price/quantity gates, immutable captured-payment grant, cross-instance serialized reservation/debit/release, duplicate prevention, partial/full refund suspension, private account controls, additive schema and QA. Actual provider cost, isolated DB/gateway and full acceptance pending; no production activation. |
| 13 | AI membership | OPEN | Recurring billing, limits, cancellation and renewals, approved price. |
| 14 | Astrologer chat | EXTERNAL | Existing consultation foundation; genuine availability, session metering and payout. |
| 15 | Astrologer voice | EXTERNAL | Actual voice channel, consent, duration and settlement. |
| 16 | Video consultation | EXTERNAL | Actual video channel and verified provider. |
| 17 | Written consultation | OPEN | Private request, acceptance, deliverable, refund and payout. |
| 18 | Follow-up packages | OPEN | Multi-session entitlement, provider agreement and expiry. |
| 19 | Individual Puja | EXTERNAL | Existing booking request foundation; real partner/fulfilment gate. |
| 20 | Group festival Puja | OPEN | Group capacity, verified organizer, participant fulfilment and refund. |
| 21 | Kumbh Puja | EXTERNAL | Existing seasonal requests; partner, date and evidence required. |
| 22 | Annual Puja | OPEN | Actual multi-event entitlement, capacity, cancellation. |
| 23 | Temple Chadhava | OPEN | Authorized temple contract, accurate services, receipts. |
| 24 | Prasad delivery | OPEN | Verified fulfilment, food safety, addresses and shipping. |
| 25 | Premium reminders | PARTIAL | Real .ics calendar export for reviewed festival, Kumbh and eclipse dates with optional local alarm and EN/HI interface; paid entitlements, opt-in server delivery and device validation remain. No paid reminder or push claim. |
| 26 | Courses | OPEN | Actual course materials, access rights and progress. |
| 27 | Webinars | OPEN | Host, dates, seat entitlement, delivery and cancellation. |
| 28 | Ebooks | OPEN | Original/licensed content, secure delivery and price. |
| 29 | Printed Kundli | OPEN | Print partner, fulfilment and shipping terms. |
| 30 | Professional SaaS | OPEN | Tenant isolation, access control, report metering and billing. |
| 31 | White-label | OPEN | Brand licensing, tenant assets and privacy review. |
| 32 | Astrology API | OPEN | Scoped credentials, documented real endpoints, rate limits and usage billing. |
| 33 | Matrimonial integration | OPEN | Authorized integration contracts, partner consent and data minimization. |
| 34 | Publisher widgets | OPEN | Embeddable accessible components, signed tenant origins and licensed use. |
| 35 | AdSense | EXTERNAL | Maintain compliant existing foundation; actual Google approval and advertising policy. |

## Release checklist

- Preserve production commit and alias; no preview or production deployment.
- Reconcile original PRs 144/151/153 already incorporated in this branch; do not independently merge them during hold.
- Review TypeScript and schema contracts, migrations, source and isolated fixtures; no final production testing until owner permits.
- Close each OPEN/PARTIAL implementation and record concrete evidence. External requirements cannot be counted as complete without real evidence. No proposed prices become live without approval.
- Independent full CI, build, visual/mobile and security acceptance, database migration plan and rollback, authenticated business flow tests, then explicit approved release and real post-deploy verification. Never claim complete based on this register.
