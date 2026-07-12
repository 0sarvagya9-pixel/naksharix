# Naksharix Production Acceptance

## Release branch

- Repository: `0sarvagya9-pixel/naksharix`
- Release branch: `complete-production-polish`
- `main` is intentionally not the release source and must not be merged blindly.
- Code-safety baseline before browser QA: `35e9900ef2f8b83a266e7ebd5cf837c303399a5a`

The final deploy must use the latest fully green head of `complete-production-polish`.

## Active production scope

- Kundli generation and saved reports
- D1/D9 charts, planetary details, and Vimshottari Dasha
- Kundli PDF generation/download
- Panchang, numerology, tarot, calculators, horoscope pages
- Signup, login, logout, and protected dashboards
- Razorpay-backed premium report unlock
- Razorpay-backed consultation booking and payment
- Approved astrologer profiles, availability, and role-based dashboards
- Legal, FAQ, contact, robots, sitemap, and SEO pages

## Intentionally parked

### AI Astrologer

- Public AI input remains unavailable.
- Legacy AI routes permanently redirect to `/ai-astrologer`.
- Server AI routes fail closed unless explicitly enabled.
- Gemini backend code is preserved for a separately approved future phase.

### Shop

- Shop remains a noindex, non-transactional Coming Soon page.
- No public catalogue, inventory, cart, product checkout, or physical-order service is active.

## Required automated gates

The release branch must remain green for:

1. Complete deterministic QA suite (`qa:all`)
2. CSRF coverage audit
3. Translated public-claim safety audit
4. Source hygiene and committed-secret pattern audit
5. ESLint
6. TypeScript typecheck
7. Production build
8. Production-like HTTP smoke
9. Git whitespace/diff check
10. Production dependency audit
11. Chromium, Firefox, and WebKit browser release QA
12. Serious/critical WCAG audit
13. Mobile and desktop overflow checks
14. Parked-route, noindex, security-header, redirect, and 404 checks

## Live deployment acceptance

A green preview is not a production release. The custom domain must serve the verified branch head before release closure.

Verify after promotion:

- `/pricing` shows active services only and no monthly AI subscriptions.
- `/talk-to-kundli` and `/chatbot` redirect to `/ai-astrologer`.
- `/ai-astrologer` and `/shop` remain parked/noindex.
- `/consultation` remains active.
- `/robots.txt`, `/sitemap.xml`, and `/api/health` pass.
- Security headers are present.
- No unsupported public claims are visible.

Deployment blocker is tracked in GitHub issue #8.

## External acceptance

SMTP/SES delivery, Razorpay controlled live transactions, DNS authentication, backups, Search Console, monitoring, and uptime require provider-dashboard or receiving-mailbox evidence. They are tracked in GitHub issue #9.

## Rollback

If the new production deployment fails smoke checks:

1. Do not merge or deploy `main`.
2. Roll back the Vercel production alias to the last known-good production deployment.
3. Keep the failing Git commit for diagnosis; do not force-push or rewrite branch history.
4. Re-run the full CI suite and live smoke before promoting another deployment.
5. Preserve payment, booking, report, and audit records during rollback.

The pre-browser-QA code baseline `35e9900ef2f8b83a266e7ebd5cf837c303399a5a` is a verified code fallback, but production rollback must use the corresponding known-good Vercel deployment rather than changing Git history.

## Release-state vocabulary

- `PASS`: verified by current logs or live evidence.
- `REVIEW_REQUIRED`: evidence is incomplete or a non-blocking decision remains.
- `BLOCKED`: a required provider, credential, environment, or live acceptance condition is unavailable.

Never mark production `PASS` from a local build or preview deployment alone.
