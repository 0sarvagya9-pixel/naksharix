# Naksharix Core Roadmap Steps 1-7 Readiness

Last updated: 2026-06-01

This audit covers the locked pre-UI roadmap only. It does not approve AI Astrologer, Shop, Consultation, or marketplace activation.

## Readiness Matrix

| Step | Status | Notes | Remaining blocker |
| --- | --- | --- | --- |
| 1. Full offline-style Kundli report | Complete | Provider-backed chart, Panchang, Dasha, Varga, numerology, Lo Shu, interpretation, remedies, and PDF-ready sections exist with section-level status. | External fixture validation remains future accuracy enhancement. |
| 2. Report DB + Admin + User history | Complete | Authenticated report requests persist to DB, admin workflow is RBAC-protected, and users see real owned requests/history. | None for current report workflow. |
| 3. PDF generation + secure download | Complete | Admin generation writes real PDF bytes and DB-backed storage metadata. Owner/admin download is protected. | Optional object storage can replace DB storage later. |
| 4. Payment/Razorpay for reports | Disabled due to env | Razorpay order, verification, webhook, DB payment state, and verified success screen exist. Public checkout remains disabled when env is incomplete. | Configure `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. |
| 5. Transit/Varga public output | Partial active | `/transits` shows provider-backed snapshot and daily-scanned sign/station timeline. Varga D1/D2/D3/D9/D10/D12 is included in report content. | Exact ingress/station minutes and personalized transit predictions need external transit fixtures and natal overlay QA. |
| 6. Shadbala/Ashtakvarga | Partial | Partial Shadbala indicators are calculated where provider data supports them: Sthana, Dig, Cheshta, and Naisargika. No total Shadbala or Ashtakvarga bindu scores are output. | Full Kala/Drik Bala formulas and reviewed Ashtakvarga BAV/SAV formulas plus fixtures. |
| 7. SEO/content engine | Complete for active pages | Active pages have metadata/sitemap coverage; hold pages remain protected from fake SEO promotion. | Future content expansion should stay editorially reviewed. |

## Delivery Status

- Secure download is the active delivery path after a real PDF exists.
- Email delivery is available only when SMTP is configured.
- Admin cannot mark a request delivered manually; delivery must go through the delivery action.
- If SMTP is missing, the request can move to `READY_FOR_DELIVERY` after PDF generation, not `DELIVERED`.

## Payment Status

Razorpay is production-shaped but not automatically public-active. Checkout should be considered active only after all required env vars are configured and a live-mode payment test passes. The payment success page requires a real `Payment` row with `status = PAID` and a provider payment id.

## Step 8 Decision

Not ready for an unconditional move to full UI redesign while full Shadbala and Ashtakvarga remain mathematically incomplete. Ready to begin Step 8 only if the business accepts these two as explicitly deferred advanced astrology modules and keeps their public output disabled.
