# Naksharix Current Handoff

Updated: 2026-07-16 (Asia/Kolkata)

## Repository authority

- Repository: `0sarvagya9-pixel/naksharix`
- Authoritative release branch: `complete-production-polish`
- Release HEAD before this non-Razorpay production package: `fb53430ae504070af64dd988e59b42b04ddcfe34`
- Default branch: `main`
- `main` and `complete-production-polish` are intentionally divergent.
- Automatic merge, rebase, reset, force-push, or branch reconciliation remains forbidden.

## Current status

- Code state: `SAFE_TO_CONTINUE`
- Vercel status for release HEAD `fb53430...`: `SUCCESS`
- Custom-domain exact-SHA state: `PRODUCTION_NOT_VERIFIED` until `/api/release` proves the deployed SHA.
- AI state for this package: `ENABLED_NOT_VERIFIED`.
- AI activation mechanism: `AI_ASTROLOGER_ENABLED=true` in Vercel configuration plus a separately configured real `GEMINI_API_KEY`.
- Shop state: active informational spiritual catalogue; ecommerce remains disabled.
- Razorpay state: owner-confirmed complete and intentionally untouched by this package.
- Database migration history: `REVIEW_REQUIRED`; the release does not yet contain an adopted production migration history.

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

### Reports, payments, and consultation

- Fixed-price report catalogue
- Razorpay order creation and signature verification
- Server-owned amount, report, purpose, and ownership checks
- Verified payment binding to report requests
- Manual-review specialist-report path
- Saved-report and download authorization
- Approved astrologer listings
- Slot and availability validation
- Serializable double-booking protection
- Razorpay-linked booking flow
- User, astrologer, and admin dashboards

### Shop

- Searchable informational catalogue
- Category filters
- Product detail and care information
- Availability enquiry language
- Indexable Shop route
- No cart, automatic checkout, stock mutation, or fulfilment promise

### AI Astrologer

- English, Hindi, and Hinglish chat UI
- Explicit Gemini-processing consent
- Sensitive-data warning
- Strict Gemini provider route
- 25-second timeout
- Fail-closed blocked, empty, timeout, provider, and network handling
- No synthetic or mock answer fallback
- Conditional page rendering and indexing
- Separate internal AI report-generator flag
- Restricted non-production diagnostics
- Production feature flag enabled by this package

AI becomes `ENABLED_AND_VERIFIED` only when the production status endpoint returns both `enabled: true` and `ready: true`, and the live AI page does not render the unavailable state.

## Production identity and acceptance

This package adds `/api/release`, which exposes only non-sensitive deployment identity:

- Vercel Git commit SHA
- Vercel Git branch
- Vercel environment
- service name

The `Production Acceptance` GitHub workflow runs after pushes to `complete-production-polish` and verifies:

- custom domain serves the exact pushed SHA
- apex and `www` hosts have working TLS
- required security headers
- `/api/health` is healthy
- production database connectivity is `ok`
- Redis is not in an error state
- AI is enabled and Gemini-ready
- AI page is live rather than unavailable
- Shop, reports, and consultation routes respond
- Shop remains non-transactional
- robots and sitemap match active features

The workflow uploads the complete acceptance evidence as a GitHub Actions artifact.

## Database migration recovery

This package adds a `Database Baseline Rehearsal` workflow that:

1. Uses a disposable PostgreSQL 16 service.
2. Validates the current Prisma schema.
3. Generates baseline SQL from an empty schema.
4. Applies that SQL only to the disposable database.
5. Confirms zero post-apply drift against `prisma/schema.prisma`.
6. Records tables, indexes, SQL checksum, and QA evidence.

This rehearsal does **not** mutate Neon or production. Production adoption still requires:

- production schema introspection
- `_prisma_migrations` evidence
- reviewed drift report
- verified backup
- restore rehearsal
- reviewed baseline SQL
- explicit production adoption command with rollback ownership

Never run `prisma migrate dev`, `prisma migrate reset`, destructive `db push`, or unreviewed SQL against production.

## External provider operations still requiring authenticated access

- Real Gemini key/model acceptance if production returns `ready: false`
- SMTP/SES credentials and one receiving-mailbox delivery test
- SPF, DKIM, DMARC, and MX verification
- Neon backup retention and restore drill
- Production schema adoption after drift review
- Search Console ownership and sitemap submission
- Ongoing uptime alerting and incident ownership

These cannot be truthfully changed from GitHub source access alone. Secrets must never be committed to GitHub, logs, documentation, or chat.

## Operations explicitly excluded

- No Razorpay changes
- No merge or reconciliation with `main`
- No product ecommerce activation
- No subscriptions activation
- No AI report-generator activation
- No synthetic AI fallback
- No production database mutation from CI
- No destructive Prisma operation
