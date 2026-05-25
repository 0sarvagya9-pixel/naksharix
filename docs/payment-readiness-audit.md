# Payment Readiness Audit

## Current Status

Payment routes and dependencies exist, but this phase does not activate public payment, paid reports, cart, checkout, shop orders, consultation payment, or automated premium delivery.

## Required Before Activation

- Environment validation for Razorpay/Stripe keys.
- Webhook signature verification review.
- Idempotent payment update handling.
- Receipt and invoice generation.
- Refund policy alignment.
- Admin dispute/refund workflow.
- Clear product entitlement mapping.
- No paid report delivery until report generation and admin review are real.

## Guardrails

- Public report request-intent flow must not claim payment.
- Hold modules must not link to checkout.
- Payment success pages must not be used by non-payment flows.
- No cart/checkout for Shop.
- No Consultation marketplace payment in this phase.

## Current Activation Decision

Payment remains disabled for public reports, Shop, Consultation, and AI flows. Razorpay/Stripe routes may exist as infrastructure, but they must fail closed when providers are not configured and must not be linked from request-intent report pages.

Run:

```bash
npm run qa:payments
```

This checks provider fallback behavior and scans public report UI for premature payment language.
