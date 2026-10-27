# NAKSHARIX consolidated release — pre-deployment engineering vs after-deploy acceptance

## Source branch and release scope
PR #40, `redesign/premium-commerce-ux-20261027`. No auto-merge/production deploy.
Pre-deploy changes: premium design, navigation/calendar contrast, original Puja copy; licensed real photographic *reference* images (not owner inventory evidence); owner-editable Shop photos/product prices and Puja offering rates; manual specialist Report prices; Shop cart, actual unpaid persisted order requests, address and My Orders, Admin Shop order transitions and shipping/tax/tracking; Puja Sankalp booking requests, customer tracking and verified partner assignment, Admin scheduling and completion record.

**Truth limitation:** Shop orders and Puja bookings are records of requests and owner-confirmed fulfilment, NOT verified online purchase payments. Live payment gateway capture/refund, signed partner terms, email inbox delivery, actual supplier stock matching, final courier tracking, real ceremony execution and customer image approval require external/live acceptance.

## Database release migration order — no runtime auto-migrations
1. Confirm verified production backup and isolated successful restore **before live DDL**.
2. Read-only audit on 2026-10-28: live Neon default branch has 38/43 Prisma model tables. `LearningProgress` and `PujaPartner` exist; `ShopCatalogueSnapshot`, `PujaOffering`, `ShopOrder`, `PujaBookingRequest` and `ManualReportOffering` are absent. Recheck immediately before migration; never assume historic inventory is still current.
3. Apply reviewed `docs/sql/20261027_shop_catalogue_snapshot.sql` for `ShopCatalogueSnapshot` after verifying backup and target database identity.
4. Review and apply `docs/sql/20261027_puja_offering.sql` for `PujaOffering`.
5. Review and apply `docs/sql/20261027_shop_orders.sql` for `ShopOrder`.
6. Review and apply `docs/sql/20261027_puja_bookings.sql` for `PujaBookingRequest`.
7. Review and apply `docs/sql/20261027_manual_report_offerings.sql` for `ManualReportOffering`.
8. Re-run read-only schema checks. Inspect `_prisma_migrations` and reconcile with Prisma baseline before any deploy. Additive DDL files are reviewed source, **not evidence they ran on production**.
9. Deploy the exact green and approved GitHub release SHA; run complete smoke/browser and Admin workflows with no live charge.
10. Only after schema and backend acceptance, authorize domain cutover. Preserve rollback image and DB recovery evidence.

## Verification required on exact candidate SHA
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm run qa:all`, `npm run qa:final-closure`.
- GitHub CI quality/static/browser, Final Code Closure complete QA/security/mobile/browser and disposable DB rehearsal.
- True HTTP role E2E on disposable database covers user-owned order, admin optimistic locking/shipping/tracking and Puja rate, Sankalp, verified Pandit and scheduling.
- Mobile desktop screenshots, actual HD URL rendering and accessibility contrast have independent acceptance; absence of a failed automated test is not owner design approval.
- Supplied partner price, inventory photos, author rights, SKU specs, regional calendar accuracy and fulfilment policy **cannot be fabricated from the source**.

## Explicitly after-deploy external acceptance
- Actual Vercel production, Neon schema/readiness, public domain health.
- SMTP delivery to controlled real inbox; monitoring alert delivery; gateway sandbox webhook and charge/refund; real partner identity/contracts, real stock photos, courier integration and completed fulfilment.
- Production checkout payments remain off until those gates pass. Owner may operate unpaid/manual fulfilment requests without misrepresenting payment collection.

## Additional manual-report pricing rule
The nine manual-service report types may display Admin-approved fees before a specialist confirms a request. Six existing Razorpay report prices are untouched and cannot be edited through the manual fee editor; otherwise the public amount and gateway capture could diverge. Showing a manual fee never collects a payment.

## Production schema audit (read-only, 2026-10-28)
Neon project `delicate-star-51216895` / `production` branch `br-holy-resonance-aqjc8l0g`.
Exactly 38 tables match 43 `model` declarations in the current source; the five missing models are the five DDL files listed above.
The separate restored-snapshot and disposable schema-rehearsal branches are not evidence of a successful **current** production restore or of deployed new tables. All read-only operations were metadata inspections, not schema writes.
A production backup or restore gate is not passed merely by a disposable PostgreSQL CI rehearsal. Production backup recovery must be verified immediately before running DDL. `_prisma_migrations` metadata is not present in the read-only audit and must be reconciled before automatic Prisma migration tooling; reviewed additive DDL is distinct from `prisma migrate deploy`.

## 2026-10-28 supplementary predeploy UI fixes
- Shop catalogue card/detail images disclose LICENSED category references separately from administrator-authorized image sources; image rights do not independently certify delivered SKU authenticity.
- The cart displays selected product thumbnails; server-side pricing, order authentication and no-payment safeguards are unchanged.
- Consultation feedback is presented as accessible 1-5 star ratings; backend rejects fractional stars.
- Product-support labels replace visible 'Ask Availability' buttons, without fabricating actual item availability or prices.
- Pending external acceptance remains: exact seller photos and fee approvals, extra Puja-specific photographs, verified partners, actual fulfilment, current-production database backup/restore, migrations, payment/refunds, release staging and final visual signoff.

## Home, Shop and Puja calendar photo-reference completion
- Two homepage services, the Shop inner hero and rolling Puja calendar banner now reuse documented, previously licensed real-reference photographs instead of matching placeholder illustrations.
- On-page source/photographer/license credits accompany new placements; photos are representative, not ownership, inventory, or performed-ceremony evidence. No new photo license or product authenticity was invented.

## 2026-10-28 live recovery clone and Admin commercial readiness
- Neon production snapshot creation was attempted but API returned `snapshots limit exceeded`. Existing named snapshot `snap-silent-wind-aqx6bfp4` is preserved; no delete was attempted.
- A new **non-production** production-HEAD branch `br-quiet-credit-aqcg7yfu` was created and verified READY. Production and clone each show 38 public tables, with matching counts for User (5), ConsultationBooking (0), SupportTicket (0), ReportRequest (0), PujaPartner (0) at inspection. The clean clone is a point-in-time copy-on-write recovery checkpoint, **not** an independent current snapshot or guaranteed recovery drill.
- Production schema remains 38/43; no live DDL executed. Snapshots limit remains a blocker to fresh independent snapshot and restore acceptance, unless approved recovery procedure establishes an equivalent valid backup.
- Admin-only `/admin/readiness` and `/api/admin/readiness` now show actual source-backed/commercial-data checks: required five tables, positive product prices, owner/supplier photo-rights records (not stock authenticity), published Puja rates, administrator-reviewed partners, specialist report fees and explicit unpaid fulfilment/payment hard stops. No external evidence is fabricated.

## 2026-10-28 Redis two-transport readiness upgrade
- Redis cache supports either existing protected `REDIS_URL` for TCP `ioredis` or officially provisioned `UPSTASH_REDIS_REST_URL` plus `UPSTASH_REDIS_REST_TOKEN`. The latter uses server-side HTTPS REST commands without new dependencies.
- Critical distributed rate-limit increments use atomic Lua `INCR` + first `EXPIRE`, not split calls. If Redis is configured but fails, the rate-limiting path **fails closed**, not silently downgraded to per-server memory; unconfigured development mode still uses memory, and production Admin Readiness reports missing shared Redis.
- Admin read-only readiness checks Redis PING through either transport. No provider credentials are read into git, and no live Redis has been provisioned by these source changes.
- Vercel Marketplace provider installation/connection and secret injection are separate account operations. They must be verified against production before claiming Redis is active.

## 2026-10-28 production Neon migration completed (latest superseding status)
- Owner authorized the assistant to complete Neon operations. Read-only preflight confirmed `delicate-star-51216895` / branch `br-holy-resonance-aqjc8l0g` / database `neondb`, with 38 existing public tables and exactly five absent feature models.
- The current-production copy-on-write recovery branch `br-quiet-credit-aqcg7yfu` had a schema-identical preimage (Neon schema diff empty) and all 38 existing-table record counts matching production before migration. Preserve this branch and the prior old snapshot, as fresh snapshot creation is account-quota limited.
- Applied the 12 exact source-reviewed additive SQL statements from the five listed `docs/sql/20261027_*.sql` files on **production**, through one Neon SQL transaction. Only CREATE TABLE, CREATE INDEX, and conditional ADD FOREIGN KEY statements were executed; no DROP/TRUNCATE/deletes/seed inserts.
- **Post-migration verified**: 43/43 model tables present; 5/5 new feature indexes present; 2/2 user FKs validated; all five new tables initially empty. The original 38 production table row counts continue to match the preserved 38-table recovery clone, including User, Session, Payment, and reports.
- `public._prisma_migrations` is still absent, so migration history baseline remains a future tooling task. DO NOT run an automatic `prisma migrate deploy` without first reconciling the existing manually applied DDL and Prisma migration history.
- This removes the missing-live-table blocker, **not** the real-price/stock/partner payment, Redis account provisioning, SMTP inbox test or Vercel release acceptance blockers. Production application remains on earlier deployed SHA; NO production deploy or payment enablement in this operation.
