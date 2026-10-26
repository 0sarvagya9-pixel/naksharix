# NAKSHARIX — Single-Cutover Pre-Deploy Handoff (2026-10-26)

## Authority and immovable constraints
This handoff prepares ONE eventual coordinated release; **it does not deploy**.
Production hostname: https://www.naksharix.com
Source: `0sarvagya9-pixel/naksharix`, protected `complete-production-polish`.
Current pre-work base commit: `e86b8699f81684d573a55ba2094bf4d03ee35ed7`.
Scope of this engineering branch: `feat/predeploy-release-closure-20261026`.
Payment/Razorpay/subscriptions remain OFF/DEFERRED.
Shop is enquiry-only, never implied stock/fulfillment. The public report
generator stays OFF. Do not switch Vercel accounts, GoDaddy, credentials, domain,
Neon database, payments or billing at this stage.

## A. What can be accepted as code
- Premium photographic homepage and photo banners plus 96-test cross-browser
  evidence from PR #31; revalidate after each changed SHA.
- Real Kundli/Panchang/horoscope/matching/numerology and tested provider paths.
  Independent scientific/astronomical validation is still separately required.
- Authenticated consultations, availability, role-gated external meeting links,
  no provider auto-provision or call uptime promise.
- Written guidance enquiries, real two-way private staff support, no expert SLA.
- Puja partner operator registry, staff review, verified-only listings, private
  enquiries. No real partner seeded, no ceremonies or prasad promised.
- Four learning lessons and owner-only saved lesson completion, plus genuine
  explanatory practice questions, **not** accredited classes or certificates.
- Mobile Expo companion plus native offline numerology; no claim of full
  native capability or Android store approval.
- Read-only schema readiness exposed to operator; public readiness discloses only
  a boolean/missing-count, not database internals.
- Console-safe monitoring only; **Sentry DSN is not an active SDK or paging**.
  Shared Redis and 24x7 alerting are not certified until credentials and testing.

## B. Evidence to have BEFORE a single production release
1. Pin exact commit SHA, audit change list, verify static/code safety plus all
   quality, disposable-DB HTTP role tests, mobile build, browser Chromium/
   Firefox/WebKit and Final Code Closure PASS **on the pinned SHA**.
2. Run `npm run qa:predeploy-bundle` (source-only) and CI's
   `scripts/qa-disposable-db-rehearsal.sh` on localhost only.
   This deliberately drops ONLY isolated empty feature tables in disposable CI
   and reapplies the exact add-only SQL from `deploy/sql/`.
3. Operator obtains and independently verifies a current **production Neon
   backup and restore test** in a separate environment. Existing CI backup
   rehearsal is on disposable Postgres and is NOT production backup proof.
4. Operator reads `npm run qa:prod-db-readonly` findings against a read-only
   production account. It is expected to FAIL on the two new tables until
   authorized migration is applied; this failure means HOLD, never bypass it.
5. Compare actual Neon table/column/index catalog and production schema
   version to staged SQL. Fix conflicts offline, protect active user data.
   **Do not run `prisma db push`, `prisma migrate dev`, or a generic
   `prisma migrate deploy` in production**: this repo uses reviewed add-only
   SQL and has no proven compatible production Prisma migration baseline.
6. After explicit release approval, apply ONLY the reviewed, SHA-pinned
   `deploy/sql/20261026-learning-progress.sql` and
   `deploy/sql/20261026-puja-partner-registry.sql` through an authorized
   database operator in a transaction, with verified rollback options.
   This step is intentionally NOT performed in the present task.
7. Rerun read-only production DB audit; both feature tables, all columns,
   required FK and indexes must be present; admin schema gate must say READY.
8. Verify real SMTP/Resend inbox delivery, real astrologer staffing,
   approved puja partner operator evidence, Redis distribution (if offered),
   monitoring and exception paging independently. Do not substitute code tests.
9. Obtain Vercel deployment capacity (Free quota or plan approval), pin exact
   Git SHA, build one **production** deployment only after DB gate.
   Preview READY is not production. Payment/diagnostics/report-gen remain OFF.
10. Verify deploy exact SHA and canonical host, health and schema readiness,
    working customer and admin flows, mobile layouts, login/OTP, reports,
    privacy/CSRF, linked consultation, puja enquiries, lessons, images,
    accessibility and business monitoring. Preserve prior live deployment ID for
    rollback. Roll back on P0/P1 functionality, privacy or schema mismatch.

## C. Halt/rollback rules
- NO RELEASE if any required code gate is FAIL, SKIPPED or UNKNOWN.
- NO RELEASE if production backup/restore evidence is absent, DB schema gate
  is missing, Vercel quota refuses production target or secrets invalid.
- NO RELEASE if public listing claims unverified experts/temples, if payment
  becomes active, or if report generator/diagnostics unexpectedly turn ON.
- Never claim "100%" based solely on green CI, a preview, or a successful build.
- On incompatible schema/error, **do not blindly roll back database** or
  delete customer records. Freeze new writes and follow the operator's tested
  backup/forward-fix plan. Previous Vercel alias may be restored separately.

## D. What does NOT become completed by this code-only handoff
Qualified humans available for sessions; video provider uptime/consent;
verified real temple contracts, ceremonies/prasad/delivery; instructors and
accredited course certificates; warehouse/vendor fulfillment; independent
astro calculation quality audit; signed Android/Apple distribution, real phone
QA; production shared Redis and paging; independent backup/restore proof;
production migration; payment intentionally deferred.

Status vocabulary is fixed:
- `CODE_STAGED`: tested source in GitHub, not necessarily merged
- `PREDEPLOY_CODE_ACCEPTED`: exact-SHA CI gates all green; no cloud cutover
- `EXTERNAL_OPERATIONS_HELD`: needs proof/provider/customer operation
- `PRODUCTION_NOT_DEPLOYED`: old live deployment still serving traffic

## E. Operator checkpoint
At continuation, obtain **fresh** GitHub protected branch SHA, draft PR and
checks plus Vercel production alias before any operation. Do not assume source
changes are deployed. Do not manufacture a one-shot deployment command until
backup, schema and provider prerequisites are satisfied.
