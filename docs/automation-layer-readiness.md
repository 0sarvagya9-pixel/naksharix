# Naksharix Automation Layer Readiness

Last updated: 2026-06-01

This document reflects implemented automation infrastructure only. It does not activate AI Astrologer, Shop, Consultation, marketplace, or a full UI redesign.

| Layer | Status | Implemented state | Env / next requirement |
| --- | --- | --- | --- |
| Razorpay payment | adapter_ready | Razorpay order creation is server-priced, env-gated, report-linkable, and webhook/client verification updates DB state only after signature/capture checks. | `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. |
| PDF storage | db_backed_active | Generated PDFs are stored as DB bytes with MIME type, checksum, storage key, driver, size, and generated timestamp. Secure download route is the only access path. | Optional R2/S3 adapter requires SDK wiring plus cloud env. |
| Email delivery | disabled_safe_env_missing | Email delivery service supports disabled and SMTP-ready modes. Delivery status is not marked sent unless SMTP send succeeds. | `EMAIL_PROVIDER=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`. |
| Report status automation | active | Allowed transitions are centralized and enforced by admin API. Generated/delivered transitions require a real PDF/delivery action. | Optional queue/worker for async PDF generation later. |
| Audit logs | active | Generic `AuditLog` and `ReportStatusHistory` models record safe metadata for report creation, admin status changes, payment events, PDF generation/download, and delivery. | Apply Prisma migration in production. |
| Rate limiting | active | In-memory API rate limits protect report creation, Panchang API, payment order/verify, PDF generation, and PDF download. | Redis-backed distributed limiter when traffic scales. |
| Monitoring | adapter_ready | Structured safe logger exists and is used in API error handling plus PDF/payment/delivery paths. | `SENTRY_DSN` can be wired later without changing call sites. |
| Queue/worker future | future_scale_layer | Current flow is synchronous/admin-triggered and safe. | Add queue before high-volume PDF/email jobs. |
| Cloud storage future | future_scale_layer | R2/S3 env readiness is documented; DB storage remains active fallback. | Add Cloudflare R2 or AWS S3 SDK adapter. |
| SES future | future_scale_layer | SES env shell is documented but not active. | Add AWS SES SDK adapter and delivery bounce handling. |

## Public Safety Boundaries

- No fake payment success: success page requires paid DB state and provider payment id.
- No fake storage URL: generated PDFs expose only secure authenticated download routes.
- No fake email delivery: missing SMTP moves a generated report to secure-download-ready, not delivered.
- No sensitive audit metadata: birth details, questions, secrets, signatures, and PDF bytes are not written to audit logs.
