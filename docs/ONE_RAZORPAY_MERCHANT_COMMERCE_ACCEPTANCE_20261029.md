# NAKSHARIX — One Razorpay merchant, four paid categories, five-point acceptance
Date: 2026-10-29. Branch: `feat/unified-razorpay-commercial-checkout-20261029`.

## Owner nonnegotiable contract
**One and only one already configured Razorpay merchant account** for paid reports, eligible Shop orders, verified Puja bookings and approved astrologer consultations. No per-category merchant onboarding, split Razorpay keys or automatic transfer to a different seller. The app's single `lib/payments/razorpay.ts` client uses `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`; Checkout uses the matching `NEXT_PUBLIC_RAZORPAY_KEY_ID`; the single signed webhook secret is `RAZORPAY_WEBHOOK_SECRET`. Mismatched public/server key IDs now fail closed.

**Do not turn on payment flags before merchant dashboard proof, authorized sandbox run, verified supplier/operator fulfilment and safe migration.** The production owner can authorize a staged activation after each gate. Nothing here proves capture, payout settlement or bank credit.

## Flow 1 — Razorpay foundation

- Server creates provider order in INR paise using authoritative server price; callback verifies HMAC and then fetches provider payment status, order ID, amount and currency; signed raw-body webhook independently reconciles captured payments.
- One gateway `Payment` ledger and `Invoice` payment-receipt record; no synthetic paid statuses, no separate payment account for Shop/Puja.
- Public and server key IDs must match. Explicit `SHOP_PAYMENTS_ENABLED` and `PUJA_PAYMENTS_ENABLED` default false. `SUBSCRIPTIONS_ENABLED` retains false.
- Previously pending provider orders are never silently recharged; attempts older than 24h return a support/reconciliation message.
- Full `refund.processed` callback, with exact original amount, updates Payment and downstream category in one serializable transaction; retries are idempotent. Partial refunds deliberately **do not** mark a full refund: they require manual accounting review. Initiation of a refund remains an authorized merchant-dashboard action, not an automatic app action.
- A receipt no longer fabricates a universal 18% GST estimate. Obtain the correct merchant GST registration, tax classification, invoices and credit-note policy from a qualified accountant.
- **Merchant-side proof still missing:** test/live mode, activated capture settings, verified webhook URL/events, actual charge success, Razorpay fee & settlements, KYC, correct named merchant legal entity, bank account and successful bank credit. Never infer the merchant account or bank settlement from a configured key name or DB order ID.

## Flow 2 — Reports

- Six fixed-price report checkouts mapped to ₹799 / ₹699 / ₹599 / ₹599 / ₹399 / ₹999. Remaining nine specialist reports stay quotation/manual-only until owner-approved prices and deliverables.
- A PAID payment can be resumed from Payment History to complete birth details using its original payment ID; customer must not pay again. Order creation also checks the same report identity and old pending attempts.
- The report is PURCHASED_AWAITING_DETAILS, **not** PDF-ready merely because money was captured. PDF generation and delivery require actual content and admin operations. Full refund revokes fixed-price report download even when previous PDF delivery remains in audit history.
- Outstanding acceptance: verified real sandbox charge, customer form completion, PDF checksum, recipient inbox delivery, replay/idempotent webhook, merchant-side matching capture. No customer transaction has been placed for this release.

## Flow 3 — Shop

- Twelve proposed market-priced catalogue items exist, but supplier stock, exact SKU authenticity, licensing/rights, tax and shipping must be real, not assumed.
- Customer requests an **unpaid** order. Admin verifies exact SKU, supplier/fulfilment HTTPS proof, 30+ character confirmation note, shipping and taxes; only then can status be CONFIRMED and final total frozen.
- Only after owner enables default-OFF SHOP_PAYMENTS_ENABLED may customer pay **that saved final total** through the **same** Razorpay gateway. The payment callback/webhook records order paymentStatus PAID; packing/dispatch is blocked before capture; tracking is required.
- A full signed Razorpay refund updates shop paymentStatus REFUNDED and cancels undelivered work. Admin cannot simply cancel a PAID order without actual refund.
- New Prisma `SHOP_ORDER` enum + `ShopOrder.fulfillmentEvidenceUrl` field require reviewed additive migration. No paid Shop operation is possible on an unapproved product.

## Flow 4 — Puja

- All 94 owner-published services are listed at ₹1,100. New requests store preferred date/Sankalp with no payment.
- A verified Pandit record with evidence, assigned operator, confirmed future ceremony date/time, matching published offer, exact price and explicit default-OFF PUJA_PAYMENTS_ENABLED are mandatory before same-merchant checkout is shown.
- No verified Pandit partners existed in production at audit time. **Do not invent an operator or activate Puja charges yet.**
- Signed full refund cancels uncompleted Puja; paid manual cancellation blocked pending verified refund. Completion must include genuine ceremony evidence and customer communication.

## Flow 5 — Consultation

- Actual app route is `/consultation/book/[astrologerId]`; it uses approved profiles and active time slots. The server and UI now compute the **same 30-minute price**: approved per-session price if present, otherwise per-minute × 30.
- The signed-in customer's email must match the booking email. Server refuses zero/invalid price; UI disables unpriced booking. Payment and signature verification use the same shared Razorpay order route and provider client.
- No approved astrologer or active slot existed in production during audit; no actual paid booking can be certified. Admin must verify people, pricing, active slots, meeting link ownership and delivery capability.

## Deployment / data migration contract

1. CI: `npm run qa:all`, `npm run qa:unified-payments`, strict typecheck, browser audit and isolated PostgreSQL rehearsal must pass for the exact final source SHA.
2. SQL: `deploy/sql/20261029_unified_razorpay_commerce.sql` is additive only. Apply after reviewed production-schema preflight; never run `prisma migrate deploy` blindly because live `_prisma_migrations` provenance was not established. Match DB enum values and new Shop field before routing any related requests.
3. Release: deploy exact verified commit to Vercel production. Verify `/api/release`, `/api/health`, reports, unpaid Shop/Puja, session pricing, protected APIs and webhook signature rejection.
4. Consentful gateway test: use the merchant's authorized **Razorpay Test Mode**, with non-admin test buyer, order-create / captured / webhook retry / failed attempt / refund / report delivery. Separate production Live Mode checkout and bank-settlement acceptance must be explicitly reviewed. Never send Razorpay secret keys, customer info or bank details into public chat.
5. Keep SHOP_PAYMENTS_ENABLED and PUJA_PAYMENTS_ENABLED **OFF** until supply/partner evidence exists. They are not a substitute for evidence.
6. Merchant bank settlement cannot be certified from the website DB. Compare Razorpay order/payment IDs, merchant legal entity, settlement ID and credited bank statement in the Razorpay Dashboard without exposing sensitive account details.

## Legacy ledger caveat

Audit found five historical Razorpay PENDING rows (three subscription, two report), no PAID rows and zero invoices, all at audit date. Do not delete, mark paid or automatically retry them; reconcile against Razorpay merchant history first. There is no evidence from this release that any payment has entered the owner's bank account.

**AdSense and encrypted-backup project remain out of scope per owner instruction.**
