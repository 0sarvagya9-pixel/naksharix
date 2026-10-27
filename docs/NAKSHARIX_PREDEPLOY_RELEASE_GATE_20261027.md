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
