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
| 14 | Auth translations | PARTIAL | OTP form complete EN/HI/Hinglish key-based messages and accessible status/error announcements; reset form EN/HI/Hinglish localized with status-based safe error messages; remaining full server/role/email localization requires review. |
| 15 | Stale report orders | SOURCE | Exact merchant-order recovery and serialized reservation; unknown/partial/refunded states fail closed; independent gateway tests pending. |
| 16 | Validate before payment | SOURCE | Direct fixed-price report server preflight, signed eligibility claim, same-page paid detail submission; verify all entry points and legacy compatibility. |
| 17 | Differentiated report benefits | SOURCE | Integrated PR153, catalogue and detail copy backed by actual report renderer. |
| 18 | Report comparison | SOURCE | Compare up to three actual priced catalogue entries; verify accessibility and mobile. |
| 19 | Sample PDF | SOURCE | Actual renderer-based fictional sample generation for 15 supported reports; outputs not rendered/inspected yet. |
| 20 | Live report delivery | POST_APPROVAL | Real purchase-to-delivery, email, retry, download and permission acceptance require explicit approval. |
| 21 | Independent astrology accuracy | PARTIAL | Cross-check real ephemerides and reference charts; do not claim certification. |
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
| 44 | Language consistency | PARTIAL | Shared authentication shell and OTP/login/recovery copy support EN/HI/Hinglish; remaining checkout, account, other forms, email and PDFs still need independent coverage and browser acceptance. |
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
| 06 | Business name numerology | SOURCE | Dedicated two-system name comparison, per-letter arithmetic and original business naming PDF, private paid package entitlement and owner-approved offer gate. Rendering, pricing approval and runtime acceptance pending. |
| 07 | Yearly 2027 | SOURCE | Rolling 12-month paid SKU preserved; actual calculated educational 2027 guide and year-aware APIs staged. No claimed prediction or externally certified ingress timing. |
| 08 | Complete Life bundle | SOURCE | Five actual calculated report components under one captured package order, private validated birth input, separate generation leases and secure downloads, refund revocation. Approval and full acceptance pending. |
| 09 | Family package | SOURCE | Three distinct consented family inputs and three independent private Kundli PDFs, per-item entitlement, checksum and refund guard. Approval and full acceptance pending. |
| 10 | Marriage planning | PARTIAL | Couple report plus original practical planning workbook as exact two-item package. Human consultation deliberately not sold without approved practitioner; add-on and full acceptance pending. |
| 11 | Human reviewed add-on | SOURCE | Paid-report checksum, explicit permission, approved practitioner quote/acceptance, same-merchant capture, restricted original-PDF download and actual human-attested response. Customer, astrologer and admin workspaces, refund and verified manual settlement ledger staged. Real expert, merchant, rendering and runtime acceptance pending. |
| 12 | AI credits | SOURCE | Dedicated default-off one-time response packs, approved model/price/quantity gates, immutable captured-payment grant, cross-instance serialized reservation/debit/release, duplicate prevention, partial/full refund suspension, private account controls, additive schema and QA. Actual provider cost, isolated DB/gateway and full acceptance pending; no production activation. |
| 13 | AI membership | SOURCE | Owner-configured exact monthly Razorpay plan, separate mandate authorization, bounded recurring cycles, signed subscription charge plus fresh payment verification, unique cycle and expiry-linked credit grants, account controls, immediate provider cancellation and refund suspension/revocation. Merchant plan/mandate, pricing, isolated DB and provider renewal/cancellation acceptance pending; no live action. |
| 14 | Astrologer chat | EXTERNAL | Existing consultation foundation; genuine availability, session metering and payout. |
| 15 | Astrologer voice | EXTERNAL | Actual voice channel, consent, duration and settlement. |
| 16 | Video consultation | EXTERNAL | Actual video channel and verified provider. |
| 17 | Written consultation | SOURCE | Private localized intake, approved-practitioner assignment and exact quote acceptance, captured payment, human response and refund/manual payout records with all three role-specific workspaces. Actual practitioner terms, merchant and runtime acceptance pending. |
| 18 | Follow-up packages | OPEN | Multi-session entitlement, provider agreement and expiry. |
| 19 | Individual Puja | EXTERNAL | Existing booking request foundation; real partner/fulfilment gate. |
| 20 | Group festival Puja | OPEN | Group capacity, verified organizer, participant fulfilment and refund. |
| 21 | Kumbh Puja | EXTERNAL | Existing seasonal requests; partner, date and evidence required. |
| 22 | Annual Puja | OPEN | Actual multi-event entitlement, capacity, cancellation. |
| 23 | Temple Chadhava | OPEN | Authorized temple contract, accurate services, receipts. |
| 24 | Prasad delivery | OPEN | Verified fulfilment, food safety, addresses and shipping. |
| 25 | Premium reminders | PARTIAL | Real .ics calendar export for reviewed festival, Kumbh and eclipse dates with optional local alarm and EN/HI interface; paid entitlements, opt-in server delivery and device validation remain. No paid reminder or push claim. |
| 26 | Courses | SOURCE | Original seven-module English course, worked examples, fourteen server-graded formative questions, private exact purchased-order entitlement, persistent per-order progress and workbook PDF. Revoked/refunded orders denied. Pricing approval, DB/browser/PDF acceptance pending; no accredited or live-instructor claim. |
| 27 | Webinars | OPEN | Host, dates, seat entitlement, delivery and cancellation. |
| 28 | Ebooks | SOURCE | Original seven-chapter Kundli study workbook with actual worked exercises and answer explanations, paid private PDF generation/download, approved-price gate. Rendering and acceptance pending; English only. |
| 29 | Printed Kundli | OPEN | Print partner, fulfilment and shipping terms. |
| 30 | Professional SaaS | PARTIAL | Tenant-isolated contracted workspace, scoped/revocable credentials and usage statements implemented. Tenant-specific report production and recurring billing still incomplete. |
| 31 | White-label | PARTIAL | Contract-approved display brand in calculation responses and escaped publisher widget, mandatory attribution. Custom report branding, licensed assets and domains remain incomplete. |
| 32 | Astrology API | SOURCE | Scoped bearer-only chart/Panchang/matching/widget calculation API, contract quota, atomic usage accounting, key expiry/revoke and estimated completed-unit statements. Actual contract, automatic billing and runtime acceptance pending. |
| 33 | Matrimonial integration | PARTIAL | Actual scoped traditional matching API with minimal coordinate/time inputs, consent and quota. Real partner contract, privacy review and integration acceptance remain. |
| 34 | Publisher widgets | PARTIAL | Escaped accessible server-rendered Panchang HTML via contracted API; no browser secrets. Signed-origin browser widget and actual publisher integration remain. |
| 35 | AdSense | EXTERNAL | Maintain compliant existing foundation; actual Google approval and advertising policy. |

## Release checklist

- Preserve production commit and alias; no preview or production deployment.
- Reconcile original PRs 144/151/153 already incorporated in this branch; do not independently merge them during hold.
- Exact hold-branch-only source-check workflow added: read-only GitHub runner, synthetic configuration, Prisma validation/generate, TypeScript and deterministic contracts; no database apply, deploy or external customer/provider calls. Final broad acceptance remains deferred until owner permits.
- Close each OPEN/PARTIAL implementation and record concrete evidence. External requirements cannot be counted as complete without real evidence. No proposed prices become live without approval.
- Independent full CI, build, visual/mobile and security acceptance, database migration plan and rollback, authenticated business flow tests, then explicit approved release and real post-deploy verification. Never claim complete based on this register.


### Independent numerical reference (staged)
- Swiss Ephemeris 2.10.03 / Moshier computed 5 synthetic charts, 50 angular positions. Checked-in prior regression values compared offline: 50/50 within 0.02 degrees; maximum discrepancy 0.005300 degrees (London Mars). This is a comparison of previously saved regression data, not a run of this development head. The Sydney Mars reference crosses a sign boundary, so angular agreement does not establish sign-label or dasha accuracy. Independent fixture runner added to qa:all; current runtime, production entry points, panchang, matching, dasha and professional acceptance remain unverified. No precision certification claims changed.
- Push revocation now fails closed when the device registry cannot be checked.

### Development source verification boundary
- Package and B2B source introduced in the hold branch only. Existing customer birth-record debug logging removed from matching route. Razorpay script loading has a bounded timeout and retry-safe shared promise. Full application build, payment, device, real provider and production acceptance not yet certified.

### Hold-only compile correction — 24 November 2026
- Run 45444313354 at d7fdcc55: Prisma install/validation and deterministic contracts passed; TypeScript failed at the B2B matching boundary (optional provider factor name passed to a required validator). Corrected via explicit runtime qualification of all eight canonical factors, exact maxima, available flags, finite scores and total consistency before passing to the existing validator. Added negative fixtures (missing name, NaN, duplicate key, invalid maximum, mismatched total). Exact new-head CI not yet confirmed. No deployment or live provider call.

- Password recovery form now uses three complete locale dictionaries, safe localized status mapping rather than raw server text, exact UTF-8 byte validation, explicit API acknowledgement before success, busy guards and accessible error associations. Isolated contract fixtures authored; no real email or browser acceptance yet. Shared legacy auth sanitization of password strings remains a compatibility/security review item (do not silently change existing password semantics).

### Authentication security and checkout continuity — 24 November 2026
- Checkpoint 4fdab11c: hold-only GitHub Actions run 45453068586 completed successfully (locked install, Prisma validate/generate, TypeScript, deterministic contracts, CSRF/source hygiene). It is not full application build or production acceptance.
- Reproduced normalized-path redirect defect: WHATWG URL parsing may return a pathname beginning with two slashes even though the parsed origin matches. Hardened normalized paths and encoded path delimiters/control characters. Exact Git blobs 7002eae76465d725dee8d6dea7d351fe3f684d11 and 74cea43739efee71edd1f15265b458cb16cf7f48 were independently reconstructed, hash-matched and executed in Node 22: 25/25 redirect fixtures and isolated strict TypeScript passed. The subsequent input-type and cross-page additions are new and await head CI.
- Staged exact OTP acknowledgement and matching returned session identity before navigation; requests are serialized and stale delivery claims cleared. Unified five login/signup/professional route shells retain layout and localized UI, carry only validated checkout return paths between routes, and exclude transactional auth routes from indexing. Added OTP identity, localization and cross-page fixtures and included redirect tests in the existing hold-only runner. Browser, actual email delivery, OAuth, checkout and accessibility acceptance remain open. No provider calls, migration or deployment authorized.

### Credential normalization guard — 24 November 2026
- Identified shared JSON sanitizer silently trimming or stripping chosen password text before signup/reset validation and hashing. New signup and reset now explicitly reject altered credential fields before sanitization, with matching client checks and localized guidance. Legacy login normalization and stored hashes are unchanged; no migration or backward-incompatible hash format. Deterministic negative/positive fixtures added to the hold-only source check. Source staged; exact-head CI and browser/reset acceptance pending.

### Shop checkout source repair
- Validated quote totals, integer paise, expiry and exact returned order snapshot checks; local cart normalization, cross-tab change handling, localized acknowledgement/errors and no automatic retry after ambiguous acknowledgement. Remaining static checkout labels, durable server-side idempotency, browser and merchant/fulfilment acceptance are not closed. Existing production deployment restrictions unchanged.

- Shop cart controls, address field labels, product names/categories, country names, postal hints, quote disclosures, payment consent and order messages now use a shared English/Hindi/Hinglish dictionary. Generic Razorpay dialog, report checkout, account-wide UI, emails, PDF copy and browser acceptance remain separate requirements.

### Release authorization and build gate
- Owner authorized deployment on November 24. Vercel full-branch preview for 7355bcdc failed after compilation at three actual ESLint errors: two reserved `module` variables in course code and one unescaped JSX apostrophe in the membership UI. Corrected identifiers and JSX entity without changing course assessment, entitlements or membership behavior. Added targeted lint to the development source gate. New full preview must pass before production consideration.
- Read-only production PostgreSQL catalog check found new AI, package, marketing, expert-service, push and business tables absent; no production migration was performed. The separate schema-compatible candidate preserves the existing production schema and revenue gates. Full development scope remains intact.

### Checkout acknowledgement identity guard — 25 November 2026
- Exact original checkout contract blob 66982e45 independently hash-matched and reproduced accepting a missing or empty provider payment reference when both acknowledgement and expected callback field were absent/empty. Validate required expected identity, well-formed nonempty Razorpay order/payment references and positive safe integer amount before client success; preserve supported duplicate acknowledgement without an order field. Isolated Node 22 synthetic assertions 34/34 and strict TypeScript passed against patched blob 86177c84. Integrated full CI and actual provider/browser acceptance remain unverified. No server payment authority or prices changed.

### Unrefunded capture evidence guard — 25 November 2026
- Found that the existing fresh provider fetch and signed capture webhook did not examine amount_refunded; the webhook also wrote a paid audit action when finalization returned null. Both paths now require an exact positive integer provider amount and explicit numeric zero refund evidence, without coercing strings or accepting missing refund evidence. Only a returned paid transaction writes the paid audit action; rejected evidence is logged for operator review. No prices, schema, provider account or production records changed.
- Isolated Node 22 synthetic capture-evidence assertions 37/37 and strict TypeScript for the new pure helper passed. Integrated source checks, provider payload compatibility, delayed/duplicate callback, concurrent refund and existing-paid reconciliation acceptance remain pending. This does not prove any genuine sale or settlement. Release hold remains in effect.

### Callback reconciliation retry and exact linkage — 25 November 2026
- Source review at 9a7a07d2 identified the already-PAID client acknowledgement returned before dependent-purpose reconciliation, and both report callbacks lacked exact current ReportRequest.paymentId guards. Unified the client retry path while preserving fresh capture and refund checks, added current linked-payment status/identity guards for captured/failed report updates, and constrained consultation updates to the consultation purpose. Seven targeted source assertions failed on original source and passed on proposed source; authored workflow regression checks. No integrated DB/concurrency/provider/browser test or deployment. Actual payment and report lifecycle acceptance remains open.

### Hold-only verification repair — 25 November 2026
- Run 45487795648 passed locked dependencies, Prisma and TypeScript but failed deterministic preflight QA at a stale assertion requiring the removed early already-paid acknowledgement. Replaced it with ordered identity/fresh capture/finalization/null rejection/reconciliation/single acknowledgement checks. Six isolated source predicate fixtures passed (current route and five negative mutations). No runtime DB/gateway acceptance or new deployment. Exact new-head CI remains pending.

### Expert review source revocation — 25 November 2026
- Previous exact-head hold-only source workflow 45497682992 completed successfully (locked install, Prisma/TypeScript and deterministic contracts; not full runtime acceptance).
- Practitioner dashboard previously exposed question/response and advertised PDF access based only on review-order entitlement or assignment state, without rechecking the underlying report's current paid state and checksum. Added current source validation using the existing transaction and a fail-closed visibility contract, including assignment and pending-payment states. Written consultation behavior remains intact, and source downloads retain their separate authorization checks. Twenty synthetic visibility cases plus wiring assertions authored for the existing deterministic CI. No live records, provider calls, price or deployment changes. Exact new-head verification and database race/browser acceptance remain pending.

### Backup export connection isolation — 25 November 2026
- Source-only hardening: previous export inherited arbitrary libpq/environment connection overrides and used TLS require rather than explicit server identity verification. The PostgreSQL 17 worker now passes only the reviewed connection fields and minimal process environment to psql and pg_dump, requires verify-full with system CA trust, disables client certificate use, and disables password prompts. Existing read-only probe, source hostname, timeouts, encryption and restore checks preserved. Expanded synthetic subprocess fixtures from six to eight, including inherited overrides and wrong host, and included these fixtures in the hold-only CI. See https://www.postgresql.org/docs/17/libpq-connect.html . These changes do not establish the missing production receipt root cause, actual TLS handshake, or restore success. No backup run, provider call or production write authorized. Exact-head fixture and CI results pending.


### Consent preference acknowledgement and localized acquisition form — 25 November 2026
- Prior hold-only workflow 45515469992 returned successful source-contract job, including locked dependency installation, Prisma/TypeScript and deterministic checks; not a production backup restore. The email-updates form previously accepted any boolean acknowledgement, could preserve checked consent after interest/language changes, and allowed overlapping events before React state settled. Added strict action-bound acknowledgement with canonical subscription timestamp, synchronous in-flight guard, localized EN/HI/Hinglish fields and explicit consent text, reset on preference changes, timeout/unknown-outcome refresh barrier, and an available withdrawal path. Existing API, consent version, no-send and authenticated-account requirements preserved. Added 12 deterministic acknowledgement cases, locale coverage and source wiring assertions to the hold-only workflow; new-head execution and actual consent lifecycle, cross-tab concurrency, provider suppression and browser acceptance remain pending. No production DB write, subscription or outreach performed.


### Localized consent smoke-test correction — 25 November 2026
- Exact hold-only source run 45523389823 succeeded. Separate disposable HTTP/auth-role CI run 45523400185 returned 34/35: marketing consent passed the database checks but failed the obsolete English active-state literal despite the test explicitly selecting Hindi. Updated the test to verify actual Hindi active and revoked state, language, mutually exclusive copy, and returned acknowledgement timestamp against the persisted database record. No assertions for authentication, explicit consent, spoofing, duplicate records or withdrawal removed. Also require current eligibility when presenting an existing subscription as active; revoked, changed-email, obsolete-version and currently ineligible accounts remain inactive. Full isolated HTTP rerun and suppression/concurrency acceptance remain pending. No production change or new outreach.


### Exact notice-version binding for marketing consent — 25 November 2026
- Previous exact head 9b6968f1 returned success for the internal source workflow 45530665077 and all seven returned pull-request workflows, including CI 45530671272, Final Code Closure 45530671251 and Database Baseline Rehearsal 45530671481. The latter include disposable browser/build/backup and restore rehearsal, not production restore or full feature acceptance.
- Source inspection found that an older open form could send consent without its displayed notice version; the API unconditionally recorded the server's current version. Subscribe now requires the exact client notice version and the API stores that validated version. The client accepts success only when the persisted consent version is returned with the canonical timestamp. Withdrawal remains available without a version. Added missing/obsolete version rejection, non-mutation of existing preferences, and acknowledgement fixtures. Exact new-head runtime checks remain pending; external provider suppression and cross-tab ordering are separate open requirements. No production change, migration, customer opt-in or email send.


### Current report entitlement and concurrent quota verification — 25 November 2026
- Exact head 9f00c51e: fixed-price report generation, download, manual delivery and automatic worker now check current payment linkage and signed refund receipts, including out-of-order receipts; the request success view distinguishes stale paid state from a verified purchase. Malformed declared PDF checksums are rejected. Preserved authorized admin bypass and legacy absent checksum compatibility; existing orphaned or differently priced paid records need operator reconciliation. Actual fetched entitlement implementation passed 23/23 synthetic dependency-stub cases. Exact source-contract run 45538808695 passed. Added disposable HTTP and worker cases for orphan, wrong SKU, refunded ledger, corrupt checksum and signed receipt. Live provider acceptance remains open.
- Added real multi-process PostgreSQL quota-counter concurrency verification to the existing nonpayment reliability workflow: 3 independent processes, 36 parallel increments, exact unique sequence, quota decision, window reset, key separation and protected audit collision. Only a disposable localhost DB is allowed. New run has not yet completed; no production-scale load claim.


### Support and cross-browser reliability repair — 25 November 2026
- Baseline 74f52351: CI quality passed 79/79 suites, 179/179 HTTP smoke, 35/35 auth/role tests, automatic report signed-refund denial and exact report entitlement HTTP fixtures. Operations run 45539047051 passed 36 unique increments across 3 processes (533 ms total), isolated encrypted restore 58/158/67 and 9/9 booking, 10/10 analytics. All other workflow runs succeeded except CI browser-audit: 247 passed, 52 skipped, one WebKit socket hang-up during unauthenticated read-only support GET. Prior 9f00c51e browser run instead failed Firefox hover on /kundli (247 passed). Kept original assertions; added bounded network reset recovery to the read-only GET and real pointer re-entry/hit-test after font layout. Server log retained for diagnosis in isolated CI. No proven production root cause or physical-device acceptance.
- Original audit 39/48: support create previously had no retry identity, and reply client generated a new ID on every attempt despite a server-side replay check. Added account-scoped deterministic ID using SHA-256 and PostgreSQL unique insert, same-content validation, exact reply mutation echo, conflicting sender/payload rejection, in-flight UI guard, unchanged retry intent, and truthful saved-versus-refresh-failure messaging. Existing clients without create intent remain compatible; web UI sends it. Added actual HTTP concurrent create, duplicate readback, changed payload and cross-role reply rejection fixtures. New head runtime results pending. No live customer messages, migration, charge, or deployment.


### Independent chart runtime and civil-day accuracy — 25 November 2026
- A21/A45: actual shared time normalization previously truncated nonzero seconds before chart evaluation. Independent Swiss Ephemeris reference for Delhi 12:00:00 versus 12:00:59 gives an ascendant change of 0.305986 degrees. Preserve nonzero seconds in both application engines, maintaining minute-only compatibility.
- Panchang previously used noon offset for midnight, searched exactly 24 hours, and formatted events using the noon offset. Independent Python zoneinfo/Swiss Moshier comparisons reproduce a false moonset on London 2023-03-26 and a one-hour moonrise discrepancy on Sydney 2026-10-04. Resolve both midnight boundaries independently, limit search to the exact civil day, format using the event's IANA timezone, and reject reversed daylight intervals instead of deriving negative Muhurat windows.
- Added 10 independently generated synthetic charts (100 angles), 8 local-day rise/set fixtures (32 events), and sign/house/nakshatra assertions against actual application functions. Prior five fixture-adapter charts retained. Tolerances fixed at 0.02 degrees and 3 minutes before runtime evaluation. New runtime acceptance pending CI; not a predictive accuracy or professional certification. No new runtime dependency, production mutation or deployment.


### Email acquisition page locale continuity — 25 November 2026
- Exact notice-version source workflow 45538151253 succeeded. At the subsequently observed head 36c094b8, the five latest returned CI/build/visual/nonpayment/Android workflows were successful; this is not full production acceptance. Fixed the remaining English-only email-updates page title, explanation, verification/sign-in/signup, ineligible state and privacy/withdrawal copy by using the existing website language cookie and account locale fallback. New subscribers default to that locale, existing explicit email preferences remain independent. Added dictionary/key/route fixtures; exact-head execution and full three-language browser review pending. No production changes, live migration, consent record, email send or outreach.
