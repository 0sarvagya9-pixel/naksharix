# NAKSHARIX — Post-deployment operational acceptance, 2026-10-28

This document records verified *read-only* and carefully guarded owner-authorized operations. The accepted live build is **`95409e176fe1ca22f96f7949ad1c8118200c7ff5`** on `complete-production-polish`, Vercel deployment `dpl_6AXWG3pZKPjUp7MBWEsSET99UERZ` READY. The historical pre-release deployment is `dpl_DAv3tMKeemubWcntcXSKteDvkALP` for rollback reference. Source changes added after the production build require **separate production deployment approval**; this page does not authorize or claim such a deployment.

## Current operational evidence

- Public `/api/release` confirmed exact live SHA and production branch. `/api/health` confirmed app and database OK, **Redis skipped** (not configured).
- Public `/api/ops/readiness` confirmed database schema ready (missingCount 0), email provider `smtp` configured with internal `resend_api` adapter, AI Astrologer ready, subscriptions and AI report-generator flags disabled. **An available email adapter is NOT proof that a message reached a mailbox.**
- Public `/api/cron/production-health` reported databaseSchema, email, AI and lockedScope true, Redis not_configured. There is no requirement to activate a gateway or provider before separate readiness validation.
- DNS via public Google DNS: `naksharix.com` SPF includes `secureserver.net`; `_dmarc.naksharix.com` publishes a quarantine policy; `resend._domainkey.naksharix.com` publishes a DKIM key; `send.naksharix.com` publishes SPF and MX (Amazon SES feedback). **Published DNS records do not certify aligned authenticated delivery for an actual message.** No mail sent during this audit.
- Owner-directed uptime monitoring now checks home, `/kundli`, `/consultation`, `/shop`, release identity and health hourly. Only confirmed outages or critical failures alert.
- On production Neon project `delicate-star-51216895`, branch `br-holy-resonance-aqjc8l0g`: 43 public tables, 10 commerce-table indexes, two validated order/puja foreign keys, 94/94 published ₹1,100 Puja offers, zero verified Pandit partners, zero Shop catalogue snapshots and zero manual-report price rows at audit. `_prisma_migrations` remains absent. DO NOT run `prisma migrate deploy` blindly.
- Previous database recovery branch `br-quiet-credit-aqcg7yfu` preserves the 38-table *pre-migration* state. Earlier post-migration rehearsal `br-holy-haze-aqlfwc3c` was inspected and matches the **43-table** production schema; it is a historical rehearsal, not an ongoing backup.
- A **new postdeploy no-compute recovery branch** was created from the current production HEAD: `br-dawn-sound-aqxaz5h2`, name `naksharix-postdeploy-recovery-20261028`, parent LSN `0/616ED68`; state READY. This preserves a current checkpoint without mutating production records. It has not been subjected to a destructive restore rehearsal and is not an automatic backup policy.
- Neon owner account is on Free v3, max 10 branches; only one manually created prior snapshot (`snap-silent-wind-aqx6bfp4`) was present and `get_snapshot_schedule` returned an empty schedule. No automatic daily backup has been enabled; do not imply otherwise.

## Controlled transactional email acceptance

The repository's admin Readiness page now includes an **explicit, POST-only, CSRF-enabled** test button. The route `/api/admin/email-test` rejects anonymous users, uses only the configured `ADMIN_EMAIL` mailbox, is rate-limited to two provider requests per hour per Admin account and does not accept user-provided recipients, subject or message text. A successful result indicates Resend API provider acceptance only. Actual inbox receipt, spam placement and delivered-message SPF/DKIM/DMARC alignment require an independent human mailbox inspection. No email is sent by build, GET, test QA, or deployment.

## Not independently accepted

1. Redis/Upstash account/provider and HTTPS credentials not provisioned, Vercel production environment lacks relevant Redis variables. Do not claim multi-instance rate-limiting is production-ready.
2. Live supplier-authenticated SKU photography, actual product identity, origin, stock, shipping, refunds and fulfilment are not verified. Licensed Shop photos are **representative** only; market prices are proposals, online Shop payment is OFF.
3. 85/94 Puja topics have curated ritual-related images, nine remain credited real *category* photos. Exact service delivery photography cannot be invented. Pandit onboarding remains owner-deferred and online Puja checkout stays gated.
4. Manual specialist-report pricing is not published and requires specific business approvals; no invented prices.
5. SMTP/Resend delivery has not been confirmed in a receiving mailbox. The new admin-only test UI must be deployed separately and then used by an authenticated owner.
6. Automatic backup scheduling, real current-point restore drill, Prisma migration tracking history, Sentry alert delivery and Google Search Console ownership/sitemap submission remain to be verified. The GSC Wizard integration reported `payment_required`; this is a provider access restriction, not a coding PASS.
7. End-to-end authenticated user flow tests, real payment capture, webhook and refund acceptance, and courier integrations require controlled test accounts or merchant/provider authorization. Do not charge or mark completed by inference.

Only the authorized Vercel deployment already recorded above has been promoted to production. This feature PR does not redeploy automatically, activate payments, provision paid services or edit production database data.


## Canonical public URL source fix (separate deployment required)

The live website redirects apex `https://naksharix.com/` to `https://www.naksharix.com/`, but the prior `NEXT_PUBLIC_APP_URL` source default was apex, so its public sitemap/robots/canonical tags could advertise a redirecting host. This PR changes the **default** to `https://www.naksharix.com` and tests that sitemap, robots and SEO metadata use the same value. The production Vercel project environment had no explicit `NEXT_PUBLIC_APP_URL` variable, **but `vercel.json` supplied an explicit apex URL** that overrides the source default. Both `vercel.json` and `lib/env.ts` now use `https://www.naksharix.com`. This is the actual source of the mismatched sitemap and canonical tags. The existing live deployment is unchanged until a separately authorized production redeploy. This does not submit a sitemap or certify Google indexing.


## Redis-independent admin email rate limit and honest Redis readiness

The admin email acceptance route now serializes count-and-claim operations using a Postgres transaction-scoped advisory lock and a time-windowed `AdminActionLog` count (2 per signed-in Admin per hour). Its existing `AdminActionLog` table is present in the 43-table production schema, so no new schema migration is required. Audit attempts are recorded before calling Resend; if the DB claim fails, **no external email request is made**. Attempts that fail at the provider still consume their quota to prevent abuse. All Vercel instances share the same database ledger. This does not make other routes' local fallback distributed.

Public `/api/ops/readiness` now calls the existing `sharedRedisConfigured()` helper instead of checking only `REDIS_URL`, so correctly configured Upstash REST credentials will no longer be falsely reported as missing. This is source-only and requires the next approved deploy. No Redis provider is provisioned by this patch.


## Multi-instance core commerce anti-abuse without Redis

Authenticated Shop order requests (5 per rolling 24h) and Puja booking requests (4 per rolling 24h) now use the existing production `ShopOrder` and `PujaBookingRequest` tables to count persisted intent records inside transactions guarded by PostgreSQL `pg_advisory_xact_lock`, keyed by the authenticated user. A quota is checked and the intent inserted under the same transaction lock, so simultaneous requests on distinct Vercel instances cannot race through a process-local memory limit. A database error fails closed and cannot record an order. No production migration or new tables are introduced. The customer still owes nothing until separately verified manual/service conditions are satisfied. Other paths that call `cacheIncrement` continue to require configured shared Redis for distributed protections; this **does not** mark Redis-ready globally.


## Public AI Astrologer quota with no Redis

Because AI chat is publicly available and uses an external metered Gemini provider, the fallback 20/day IP quota may not rely on server-instance memory. The source now uses a shared PostgreSQL audit-and-lock claim if Redis is missing, or the existing atomic Redis counter if Redis is configured. The DB audit stores only an HMAC-SHA256 pseudonymized client IP using the existing authentication secret (no plaintext client IP); it counts at most 20 accepted chat attempts per IP in rolling 24h, and obtains a transaction-scoped advisory lock before count + insert. The provider call occurs only after successful claim. This is a privacy and cost-abuse guard, **not** a guarantee against VPNs, rotating IPs or distributed botnets, and not a claim that all other app rate limits are shared. Requires the separately authorized next production release. Quota records in `AuditLog` require an operational retention review as the service grows.


## Public authentication shared throttling (source-only)

The signup (5 per IP/hour), password login (8 per IP/minute), OTP request (8 per IP/10 min, 4 per destination/10 min) and OTP verification (15 per IP/10 min, 10 per destination/10 min) routes now use `claimPublicAuthQuota`. It stores HMAC-SHA256 pseudonyms, a fixed operation scope and timestamp in the existing PostgreSQL AuditLog, serializing the count-and-insert with a transaction-scoped advisory lock across Vercel serverless instances. No raw client IP or destination email is stored in the audit record; the authenticated email still exists separately in its legitimate user/OTP record. All failures of the shared quota storage fail closed. This is a basic guard, not a guaranteed defense against rotating addresses/IPs. Logs need a privacy retention policy. **Not deployed until next authorized cutover.**
