# NAKSHARIX — independent non-payment acceptance (4 November 2026)

Scope: **No Razorpay payment, merchant, settlement, refund or AdSense approval/serving modification.** This record distinguishes reviewed source, executable tests, running provider configuration and independent external fulfilment evidence. Never label an item PASS without its acceptance record.

## Code improvements in this release
- **Report PDF generation:** explicit admin confirmation, saved detailed birth-input/chart review notes, READY_FOR_GENERATION state, matching authorized review history, verified entitlement gates unchanged, no PDF overwrite and conditional storage claim. The existing private PDF file and authenticated download workflow remain the only delivery path.
- **AI Report Generator:** replaces fake fallback with strict Gemini provider response or 503; real provider output is an **unverified professional draft only**, rate-limited to four attempts/hour per authorized professional through Postgres transaction and advisory lock (no Redis dependence); no paid report entitlement, signed delivery, chart verification or PDF persistence is fabricated.
- **Transactional email acceptance:** real server-only Resend adapter, authenticated admin-only single/suite controls, DB-backed one owner-initiated 11-category suite/day, fixed owner-approved recipient in the sensitive `EMAIL_QA_RECIPIENT` deployment variable, 11 fixed no-PII synthetic subjects, idempotency keys. Nothing is sent until an authorized owner manually clicks the test. A 200 or 207 is **provider acceptance**, not Gmail inbox delivery or SPF/DKIM/DMARC verification.
- **Operations metrics:** authenticated, no-PII counts of real Shop/Puja/report/support rows and approved service partners. The dashboard explicitly avoids claiming website visitors, paid conversions or verified deliveries.
- **Shop product images:** owner/supplier rights and exact-SKU evidence wording clarified. Reference photographs must never be relabeled as actual dispatch-ready merchandise.

## Remaining non-code requirements, with exact evidence
1. Real Resend to Gmail: operator triggers admin readiness suite; record each message's From domain, Resend acceptance, receiving mailbox + SPAM appearance. A Gmail-to-Gmail test is **not** a production Resend test.
2. SPF/DKIM/DMARC: check original delivered message headers for authenticated alignment, not only public DNS TXT presence.
3. Encrypted scheduled backup: current GitHub `free-encrypted-db-backup.yml` is fail-closed until `BACKUP_DATABASE_URL` repository secret and `BACKUP_AGE_RECIPIENT` repository variable are securely set. Neon Free permits a recovery branch but does not offer scheduled snapshots. Complete a clean-room restore to a disposable Postgres before calling PASS.
4. Exact Shop photographs: upload legal owner/supplier images per SKU with source proof and exact delivered item approval; public reference photos do not count.
5. Real order fulfilment: carrier tracking, shipping/packing evidence, acceptance by customer; a database status change does not prove arrival.
6. Actual Pandit: identify and get consent/credentials from a real partner, approve in `/admin/puja-partners`; confirm schedule and genuine ceremony evidence. Never seed fake providers.
7. Report PDF acceptance: independently examine a private generated PDF for calculation correctness, correct owner-only download and actual email receipt; a synthetic test record is not a real customer delivery.
8. Search Console: property verified, submitted sitemap, crawl and indexed counts plus organic impressions/clicks from the connected Google account. IndexNow HTTP 200 only means submission accepted, not ranking/indexing.
9. 37 extra locales: native reviewers confirm terminology and cultural accuracy on actual content. Fallback strings or machine translations do not establish localized SEO readiness; no unreviewed doorway pages.
10. Redis and Sentry: existing code supports Upstash REST / Redis TCP and a privacy-minimized Sentry envelope; neither external account nor provider receipt may be invented. Integrations need authorized connected accounts and protected service credentials.
11. Visitor analytics: Vercel Web Analytics API returned `web_analytics_not_enabled` before this release. Database operational counts are real, but **not** visitor/pageview tracking. Enable provider analytics and verify appropriate visitor consent and non-PII route reporting before acceptance.
12. AI draft: flag `AI_REPORT_GENERATOR_ENABLED` may be activated only after exact-head CI + preview READY, configured supported Gemini model and an operator demo with real provider output. Paid automatic report generation remains a separate reviewed business process; never silently charge or deliver.

## Go/no-go rule
Each engineering release must have exact SHA CI and browser gates + preview build READY, merged into `complete-production-polish`, Vercel production deployment READY and live domain `/api/release` exact SHA. Any missing evidence above remains OPEN regardless of code success. Under no circumstances call the entire business website 100% accepted without it.
