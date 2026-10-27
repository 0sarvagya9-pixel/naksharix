# NAKSHARIX — Final release decision ledger (27 October 2026)

## Updated owner scope
Owner requested a single production release for premium photo UI, two-year Hindu Puja calendar, real Puja booking, lower-priced verified shopping products with genuine/licensed photographs, Razorpay payments, refunds and fulfillment.
Earlier payment-deferred preference is superseded as a requested development scope. It is NOT authorization to accept charges for unavailable fulfillment.

## Source and production evidence
- Premium photo UI base protected branch complete-production-polish: e86b8699f81684d573a55ba2094bf4d03ee35ed7.
- Draft PR #33 at 8560ce85c7ffd7d7da6567a64ffde9b8d6886555: exact-SHA full CI, Final Code Closure, disposable DB rehearsal PASS. Covers 58 major reviewed observances, not comprehensive regional/tithi festivals.
- Draft PR #34: payment late-event safety patch on top of PR #33. New exact-SHA tests must pass, never borrow previous green checks.
- Production Vercel alias still points to deployment dpl_73XKyugmTTAf5KLreGZxNchyA9q2 / commit 0ac6f284ef477ed57952bd77a723bd68aec293fa, not the new premium UI.
- Live public health endpoint HTTP 200 and database OK; old code does not verify new LearningProgress/PujaPartner schema readiness.

## Remaining release blockers
1. Verified real Puja operators, pandit contracts, date/temple permissions, capacity, Sankalp privacy, cancellations, actual ceremony completion and prasad shipping when promised.
2. Suppliers, SKU authenticity, item equivalence, picture licenses/ownership, signed product prices, fresh inventory, shipping/tax/returns/refunds and logistics.
3. Market price audits with same variant, comparable tax/shipping and margin-aware undercut; 2% lower is only a candidate, never automatically advertised as cheapest.
4. Persistent shop/Puja order models, concurrency-safe stock/capacity reservations, server-owned prices, Razorpay checkout, verified webhooks and reconciliation, refunds/disputes and fulfillment.
5. All major regional vrats/puja and city/sunrise based observance rules; verified data for 2029+ as rolling window advances.
6. Independent current production Neon backup and restore test, read-only schema drift audit, approved additive migrations and post-migration schema readiness.
7. Real SMTP inbox acceptance, approved astrologer availability, monitoring/error paging, phone QA, SEO/translation, independent astronomy calculations and production E2E.
8. Latest exact SHA CI, three-browser role E2E, negative and positive gateway sandbox tests, Vercel capacity, rollback proof and canonical production acceptance.

## Fail-closed
Never charge customers or advertise delivery without real supply and authorized operations. Do not copy competitor photos without rights. Preview READY is not production acceptance. Do not deploy, merge to protected production branch, run production migrations or activate SHOP/PUJA checkout until evidence passes. No production data writes performed by this ledger.
