# Naksharix Production Acceptance

## Release authority

- Repository: `0sarvagya9-pixel/naksharix`
- Authoritative release branch: `complete-production-polish`
- Phase 2 release baseline: `10c9ea0f6b41f8c1203d3dee9a774836f06b5347`
- `main` is intentionally divergent and is not the automatic release source.
- Do not merge, rebase, reset, or reconcile `main` and `complete-production-polish` without a separately approved project.

The production deployment must use the latest fully green, explicitly reviewed head of `complete-production-polish`. A successful preview or Vercel commit status is not sufficient evidence that the custom production alias serves that commit.

## Active code-side scope

### Astrology and user workflows

- Kundli generation and saved reports
- D1/D9 charts, planetary details, and Vimshottari Dasha
- Kundli PDF generation and authorized download
- Panchang, numerology, tarot, calculators, horoscope, and matchmaking routes
- Signup, login, logout, sessions, protected dashboards, and role checks

### Reports, payments, and consultation

- Fixed-price report catalogue connected to Razorpay checkout
- Server-owned report pricing and amount validation
- Razorpay signature verification and webhook handling
- Verified payment binding to report requests
- Manual-review flow for specialist reports without fixed prices
- Approved astrologer profiles and availability
- Serializable consultation double-booking protection
- Razorpay-linked consultation booking
- User, astrologer, and admin booking/report surfaces

### Shop

- Searchable **informational spiritual catalogue**
- Category filters, product details, care notes, disclaimers, and availability enquiry
- Public and indexable catalogue route
- No cart, automatic checkout, stock mutation, inventory promise, or fulfilment guarantee

### AI Astrologer

- **Readiness-gated Gemini AI chat**
- English, Hindi, and Hinglish UI
- Explicit provider-processing consent
- Sensitive-data warning
- Strict provider path with configurable model
- 25-second timeout
- Fail-closed provider, blocked, empty, timeout, and network behavior
- No synthetic or mock answer fallback
- Conditional rendering, robots, and sitemap inclusion only when ready
- Separate disabled-by-default internal AI report-generator flag
- Restricted non-production diagnostics

AI is not considered active merely because the code exists. It is active only when the explicit feature flag, a real provider key, production configuration, live behavior, and safety acceptance are verified.

## Intentionally disabled capabilities

- Shop cart and product checkout
- Automated physical-order fulfilment
- Public subscriptions
- Synthetic AI fallback
- AI report generation unless separately enabled and reviewed

These disabled capabilities must not be described as active services.

## Required automated gates

The release branch must remain green for:

1. Complete deterministic QA suite (`qa:all`)
2. Release-state and documentation truth audit
3. CSRF coverage audit
4. Translated public-claim safety audit
5. Source hygiene and committed-secret pattern audit
6. ESLint
7. TypeScript typecheck
8. Production build
9. Production-like HTTP smoke
10. Git whitespace/diff check
11. Production dependency audit
12. Chromium, Firefox, and WebKit browser release QA
13. Serious/critical WCAG audit
14. Mobile and desktop overflow checks
15. Feature-gate, indexing, security-header, redirect, and 404 checks

## Live deployment acceptance

Production acceptance requires fresh evidence from the custom domain for the exact release SHA.

Verify after promotion:

- deployed SHA and production alias
- `/api/health` returns the expected healthy state
- `/pricing` shows active services only and no unsupported subscriptions
- `/talk-to-kundli` and `/chatbot` redirect to `/ai-astrologer`
- `/shop` serves the informational catalogue without ecommerce controls
- `/ai-astrologer` is unavailable/noindex when not ready, or live/indexable only when fully ready
- `/api/ai/status` exposes only non-sensitive enabled/ready state
- `/reports` and paid-report continuation render correctly
- `/consultation` remains active
- `/robots.txt` and `/sitemap.xml` match the actual feature state
- security headers are present
- no unsupported public claims are visible
- production database state is compatible with the deployed Prisma schema

Use `PRODUCTION_NOT_VERIFIED` whenever the exact production SHA cannot be proven.

## Database acceptance

The verified release baseline did not contain a Git-tracked Prisma migration history. Do not create or apply a baseline against production blindly.

Follow `docs/NAKSHARIX_DATABASE_MIGRATION_RECOVERY.md` and require:

- production schema evidence
- drift comparison
- isolated disposable-database rehearsal
- backup and restore evidence
- reviewed SQL
- explicit production approval

Stop if Prisma requests reset, destructive change, or data-loss acceptance.

## External acceptance

The following require authenticated provider dashboards, receiving-mailbox evidence, or infrastructure evidence:

- SMTP/SES delivery
- SPF, DKIM, DMARC, and MX records
- Razorpay live webhook configuration
- controlled live payment acceptance after relevant configuration changes
- production database backups and restore drill
- Search Console and live sitemap submission
- analytics privacy verification
- monitoring, uptime checks, alert ownership, and incident response
- Gemini provider readiness before activation

Track unresolved external acceptance separately from code completion. Do not fabricate PASS from repository evidence alone.

## Rollback

If a production deployment fails acceptance:

1. Do not merge or deploy `main`.
2. Roll back the Vercel production alias to the last known-good production deployment.
3. Keep the failing Git commit for diagnosis; do not force-push or rewrite branch history.
4. Re-run focused validation, full CI, and live smoke before another promotion.
5. Preserve payment, booking, report, user, and audit records.
6. Do not use database reset or destructive push as a rollback mechanism.

## Release-state vocabulary

- `PASS`: verified by current logs or live evidence for the exact tested/deployed commit.
- `SAFE_TO_CONTINUE`: repository state allows controlled feature-branch work.
- `PRODUCTION_NOT_VERIFIED`: code or CI exists, but the custom production deployment is not proven.
- `DISABLED_SAFELY`: code is present but unavailable behind an explicit fail-closed gate.
- `REVIEW_REQUIRED`: evidence or approval is incomplete.
- `BLOCKED`: a required provider, credential, environment, database, or live acceptance condition is unavailable.

Never mark production `PASS` from a local build, pull-request CI, or preview deployment alone.
