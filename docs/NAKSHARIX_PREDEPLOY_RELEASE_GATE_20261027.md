# NAKSHARIX consolidated release — pre-deployment engineering vs after-deploy acceptance

## Source branch and release scope
PR #40, \`redesign/premium-commerce-ux-20261027\`. No auto-merge/production deploy.
Pre-deploy changes: premium design, navigation/calendar contrast, original Puja copy; licensed real photographic *reference* images (not owner inventory evidence); owner-editable Shop photos/product prices and Puja offering rates; Shop cart, actual unpaid persisted order requests, address and My Orders, Admin Shop order transitions and shipping/tax/tracking; Puja Sankalp booking requests, customer tracking and verified partner assignment, Admin scheduling and completion record.

**Truth limitation:** Shop orders and Puja bookings are records of requests and owner-confirmed fulfilment, NOT verified online purchase payments. Live payment gateway capture/refund, signed partner terms, email inbox delivery, actual supplier stock matching, final courier tracking, real ceremony execution and customer image approval require external/live acceptance.

## Database release migration order — no runtime auto-migrations
1. Confirm verified production backup and isolated successful restore **before live DDL**.
2. Independently check the preexisting \`LearningProgress\`, \`PujaPartner\`, \`ShopCatalogueSnapshot\` and their constraints/foreign keys. Do not overwrite unknown live columns.
3. Review and apply \`docs/sql/20261027_puja_offering.sql\` for \`PujaOffering\`.
4. Review and apply \`docs/sql/20261027_shop_orders.sql\` for \`ShopOrder\`.
5. Review and apply \`docs/sql/20261027_puja_bookings.sql\` for \`PujaBookingRequest\`.
6. Re-run read-only schema checks. Inspect \`_prisma_migrations\` and reconcile with Prisma baseline before any deploy. Additive DDL files are reviewed source, **not evidence they ran on production**.
7. Deploy the exact green and approved GitHub release SHA; run complete smoke/browser and Admin workflows with no live charge.
8. Only after schema and backend acceptance, authorize domain cutover. Preserve rollback image and DB recovery evidence.

## Verification required on exact candidate SHA
- \`npm run lint\`, \`npm run typecheck\`, \`npm run build\`, \`npm run qa:all\`, \`npm run qa:final-closure\`.
- GitHub CI quality/static/browser, Final Code Closure complete QA/security/mobile/browser and disposable DB rehearsal.
- True HTTP role E2E on disposable database covers user-owned order, admin optimistic locking/shipping/tracking and Puja rate, Sankalp, verified Pandit and scheduling.
- Mobile desktop screenshots, actual HD URL rendering and accessibility contrast have independent acceptance; absence of a failed automated test is not owner design approval.
- Supplied partner price, inventory photos, author rights, SKU specs, regional calendar accuracy and fulfilment policy **cannot be fabricated from the source**.

## Explicitly after-deploy external acceptance
- Actual Vercel production, Neon schema/readiness, public domain health.
- SMTP delivery to controlled real inbox; monitoring alert delivery; gateway sandbox webhook and charge/refund; real partner identity/contracts, real stock photos, courier integration and completed fulfilment.
- Production checkout payments remain off until those gates pass. Owner may operate unpaid/manual fulfilment requests without misrepresenting payment collection.
