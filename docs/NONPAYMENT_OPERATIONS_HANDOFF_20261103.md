# NAKSHARIX — Non-payment operations and acceptance (3 November 2026)

## Deliberate release scope
This change does **not** initiate, verify, refund, settle, reconfigure or modify any Razorpay payment transaction. Existing payment admission and state controls remain untouched.

## Implemented code-side work
1. After an administrator commits a valid Shop order status transition, the server attempts a single customer-facing transactional **status** email. Both order/booking owner accounts retain access to authenticated status tracking even when the email provider fails.
2. After an administrator commits a valid Puja booking status transition, the same fail-soft status notification is attempted. Public messages never claim a named priest has been appointed merely because the owner coordinates the ceremony.
3. Status dropdowns expose only supported server-side next transitions; tracking and ceremony dates are shown to the customer without false delivered/partner assignments.
4. Report delivery no longer resends an email when a report is already recorded `DELIVERED + email_sent`. Admin PDF regeneration cannot overwrite already-delivered report evidence.
5. Correct the all-fixed-price report readiness bug (0 manual-only report offers is expected with 15/15 canonical fixed offers).
6. Hourly public monitoring checks 14 critical, non-private routes, schema and email/report-storage readiness, the real Shop/Puja/report HTML and search engine sitemap/robots. GitHub issue alerts are retained.
7. Scheduled workflows execute on GitHub **default** branch `main`. The main-branch uptime workflow must check out the authoritative `complete-production-polish` branch; the source monitor script lives on that release branch.

## Observed provider and security evidence
- Live `/api/ops/readiness`: email provider `smtp` (Resend API), `enabled=true`, `missingCount=0`; report storage is enabled with database driver; `databaseSchema.ready=true`; Redis and centralized Sentry unavailable.
- DNS Google public resolver (2026-11-03): `naksharix.com` MX points to SecureServer/GoDaddy; domain SPF `include:secureserver.net`; DMARC `p=quarantine`; Resend DKIM TXT at `resend._domainkey.naksharix.com`; `send.naksharix.com` SPF and MX exist.
- These records do **not** prove a particular message reached an inbox or passed DMARC alignment. For final acceptance use the existing authorized `/admin/readiness` email test and check message headers in the actual recipient inbox.
- Production Vercel release before this PR: `d965a4a6f1990b53c8d990d348f1e7310ee04266`. Confirm the post-release exact SHA separately.

## Recovery status and constraints
- Existing Neon production branch `br-holy-resonance-aqjc8l0g` and new compute-free recovery branch `br-empty-bird-aqbqnn5q` (READY, created 2026-11-03). Do not delete the last recovery branch or assume that branch creation validates restoring all customer workflows.
- GitHub free encrypted backup workflow is **HOLD**: `BACKUP_DATABASE_URL` GitHub secret and `BACKUP_AGE_RECIPIENT` repository public variable must be configured. Do not copy DB credentials from Vercel into source, workflows, action logs or this document. Existing fail-closed ciphertext-only workflow is retained.
- Rehearsals in disposable databases do not establish scheduled off-site backup retention. Production weekly/monthly restore evidence must be independently documented.

## External acceptance remaining, not fake-completed
- Genuine customer email inbox delivery and sender SPF/DKIM/DMARC alignment from that message.
- Product-specific supplier-authorized photographs, exact delivered SKU, courier tracking and an actual delivered order.
- Pandit/service provider confirmation where relevant, actual ceremony and completion evidence.
- Real report PDF review, authenticated customer download and email receipt from a real, permitted case; payment flows are explicitly out of scope.
- Google Search Console property/crawl/index metrics and the 37 not-yet-native-reviewed language translations. Never publish unreviewed thin SEO doorway copies.
- Google AdSense site approval and certified CMP/real serving acceptance, all controlled by their provider/owner.
- Independent encrypted backup with off-site retention and recovery drill.
- Redis/Sentry/analytics instrumentation may need authenticated third-party provisioning, secrets and regional-consent controls. Do not infer provider access or a paid plan.

## Acceptance
`npm run qa:nonpayment-operations` is included in `npm run qa:all`; GitHub's exact-HEAD CI, mobile, browser, security, disposable DB rehearsal, preview and post-deployment read-only public health gates must pass. No production customer data, orders, Puja bookings or payment records are modified by this PR's tests.
