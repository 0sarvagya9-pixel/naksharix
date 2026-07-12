# Naksharix Final Remaining Work Status

## Scope completed in this branch

- Replaced stale legal copy that said automatic payments were inactive.
- Updated Privacy Policy for active accounts, saved reports, consultations, cookies, Razorpay payment metadata, and deletion/correction requests.
- Updated Terms & Conditions for active digital reports, verified payments, consultation booking, and acceptable use.
- Updated Refund & Cancellation Policy for duplicate/failed payments, immediate digital unlocks, and consultation cancellation/rescheduling.
- Updated Disclaimer to avoid guaranteed medical, legal, financial, relationship, career, or other outcomes.
- Added a Delivery Policy covering digital reports, consultation confirmations, email fallback behavior, and the parked Shop.
- Updated About and Contact content to match the current product scope.
- Updated footer links so active services and all legal pages are reachable.

## Intentionally parked

### AI Astrologer

Status: Coming Soon / parked.

The public chat remains disabled until a reliable provider response path, quota handling, safety review, and production verification are complete. Backend code may remain for later work, but the broken chat experience must not be exposed publicly.

### Shop

Status: Coming Soon / parked.

No public cart, checkout, physical order, or shipping claim should be enabled until catalogue, inventory, fulfillment, refund, and delivery operations are ready.

## External configuration

### Email delivery

Email code can operate only when valid SMTP environment variables are configured in the deployment environment. Missing email configuration must not block account access, paid digital report access, or confirmed consultation visibility in the dashboard.

## Active business flows to preserve

- Auth and saved reports
- Kundli generation and PDF
- Razorpay premium report payment and server-side verification
- Horoscope hub and zodiac pages
- Active free calculator engines
- Consultation booking, Razorpay verification, dashboards, and admin status management

## Release checklist

Before production deployment:

1. Pull this branch locally.
2. Run `npm run typecheck`.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Run `git diff --check`.
6. Smoke-test legal routes and footer links.
7. Smoke-test premium report payment and consultation booking to confirm no regression.
8. Deploy only after all checks pass.
