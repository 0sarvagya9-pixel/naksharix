# Naksharix Current Handoff

Updated: 2026-07-16 (Asia/Kolkata)

## Repository authority

- Repository: `0sarvagya9-pixel/naksharix`
- Authoritative release branch: `complete-production-polish`
- Release baseline before the final code-side closure work: `10c9ea0f6b41f8c1203d3dee9a774836f06b5347`
- Default branch: `main`
- Branch state: `main` and `complete-production-polish` are intentionally divergent.
- Automatic merge, rebase, reset, force-push, or branch reconciliation is forbidden.

## Current status

- Code state: `SAFE_TO_CONTINUE`
- Production state for the latest release baseline: `PRODUCTION_NOT_VERIFIED`
- AI state: `DISABLED_SAFELY` unless both the explicit feature flag and a real Gemini key are ready.
- Shop state: active informational spiritual catalogue; ecommerce remains disabled.
- Subscriptions: disabled unless separately launched and reviewed.
- Database migration history: `REVIEW_REQUIRED`; `prisma/migrations` was not present at the release baseline.

## Completed code-side scope

### Astrology and user workflows

- Kundli generation
- D1 and D9 charts
- Planetary details
- Vimshottari Dasha
- Panchang
- Horoscope routes
- Matchmaking
- Numerology
- Tarot
- Saved Kundli reports
- Kundli PDF generation and download
- Authentication and protected dashboards

### Reports and payments

- Fixed-price report catalogue
- Razorpay order creation and signature verification
- Server-owned amount, report, purpose, and ownership checks
- Verified payment binding to report requests
- Manual-review flow for specialist reports without fixed prices
- Saved-report and download authorization checks

### Consultation

- Approved astrologer listings
- Slot and availability validation
- Serializable double-booking protection
- Razorpay-linked booking flow
- User, astrologer, and admin dashboard surfaces
- Resilient profile-image fallback

### Shop

- Searchable informational catalogue
- Category filters
- Product detail and care information
- Availability enquiry language
- Indexable Shop route
- No cart, automatic checkout, inventory mutation, or fulfilment promise

### AI Astrologer

- English, Hindi, and Hinglish chat UI
- Explicit Gemini-processing consent
- Sensitive-data warning
- Strict Gemini provider route
- 25-second timeout
- Fail-closed provider, blocked, empty, timeout, and network handling
- No synthetic or mock answer fallback
- Conditional page rendering and indexing
- Separate internal AI report-generator flag
- Restricted non-production diagnostics

## Verification evidence

The release branch has recorded successful CI coverage for:

- Complete deterministic QA suite
- CSRF and translated-claim audits
- Source hygiene and recognized-secret scanning
- ESLint
- TypeScript typecheck
- Production build
- Production-like HTTP smoke
- Git diff/whitespace check
- Chromium, Firefox, and WebKit browser QA
- Responsive widths and serious/critical accessibility checks

CI success proves the tested commit in the CI environment. It does not by itself prove that the custom production alias serves that commit.

## Production evidence

The last explicitly documented custom-domain production acceptance predates the `10c9ea0...` Phase 2 release baseline. A Vercel success status or preview URL must not be treated as proof that `www.naksharix.com` serves the latest release.

Before declaring production complete, independently verify:

- deployed commit SHA
- custom-domain alias
- `/api/health`
- `/shop`
- `/ai-astrologer`
- `/api/ai/status`
- `/reports`
- `/consultation`
- `/robots.txt`
- `/sitemap.xml`
- security headers
- database migration state

## External operations still requiring provider evidence

- Vercel production alias and environment readiness
- Production PostgreSQL schema and migration history
- Automated database backups and restore drill
- Razorpay live webhook configuration
- Controlled live payment acceptance after relevant configuration changes
- SMTP/SES delivery and sender-domain authentication
- SPF, DKIM, DMARC, and MX verification
- Search Console and sitemap submission
- Monitoring, uptime alerts, and incident ownership
- Gemini key/model acceptance before AI activation

These are operational acceptance tasks, not missing frontend placeholders. Never fabricate completion when provider evidence is absent.

## Database stop rule

Do not run migration commands against production, a shared Neon database, or any database containing unrecovered data until the procedure in `docs/NAKSHARIX_DATABASE_MIGRATION_RECOVERY.md` has been completed and approved.

Stop immediately if Prisma requests a reset, destructive change, or data-loss acceptance.

## Current blocker

The primary blocker to a truthful `100% production complete` declaration is external production and database evidence—not an unimplemented Coming Soon screen.

## Safe next sequence

1. Keep changes on a feature branch based on `complete-production-polish`.
2. Pass focused release-state QA.
3. Pass the full existing CI matrix.
4. Review the pull request against `complete-production-polish`.
5. Do not merge into `main`.
6. Do not deploy, migrate, or enable providers without separate production approval and evidence.

## Operations not performed by this handoff

- No merge to `main`
- No release-branch reconciliation
- No force-push
- No production deployment
- No database mutation
- No migration baseline execution
- No Razorpay setting change
- No Gemini key or feature-flag change
- No subscription or ecommerce activation
