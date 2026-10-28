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
