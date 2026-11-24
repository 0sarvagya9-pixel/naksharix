# AI monthly membership — release gate
Official provider references:
- https://razorpay.com/docs/api/payments/subscriptions/create-subscription/
- https://razorpay.com/docs/api/payments/subscriptions/cancel-subscription/
- https://razorpay.com/docs/webhooks/subscriptions/
- https://razorpay.com/docs/payments/subscriptions/integration-guide/
No merchant plan, key, charge, subscription, cancellation or migration has been created by this source-only commit. Sales flag defaults false.
- Approve an existing exact INR monthly plan, model, integer price, credits and 2–12 cycles. No trials, add-ons, discounts or automatic unapproved price changes. Provider authorization uses the returned, strictly allowlisted hosted link.
- A signed subscription.charged event with the immutable local mapping and exact cycle evidence plus fresh provider payment read is required before a unique paid cycle and credit grant. Authorization alone never grants units. Each grant is usable only within the paid period and does not roll over. One-time packs retain their existing behavior. A failed or canceled mandate never creates a credit.
- Immediate provider cancellation stops future charges only when confirmed; previously paid credits remain available to their paid expiry unless refunded. Ambiguous creation or cancellation blocks duplicate mandates. A refund suspends/revokes the affected grant; no automatic refund or cancellation is inferred.
- Before release: apply additive migration after AI credit ledger in disposable DB, verify exact plan and actual hosted URL formats in merchant test mode; signed duplicate/out-of-order events, initial authorization, captured renewals, late and partially refunded payments, overlapping periods, cancellation timeouts, key rotation and reconciliation. Record provider response acceptance, actual ledger and entitlement evidence; preserve release hold.
