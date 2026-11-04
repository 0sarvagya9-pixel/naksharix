# Naksharix

Naksharix is a production Next.js astrology platform with authenticated Kundli workflows, Panchang, horoscope, numerology, tarot, matchmaking, premium digital reports, approved astrologer consultations, an opt-in Gemini-backed AI Astrologer, and an informational spiritual Shop catalogue.

## Locked production scope

- Authoritative release branch: `complete-production-polish`.
- Razorpay is the active payment provider for supported report and consultation flows.
- AI Astrologer can be enabled independently with `AI_ASTROLOGER_ENABLED=true` and a real Gemini key.
- `AI_REPORT_GENERATOR_ENABLED` independently controls the authorized professional draft tool; it never silently delivers a paid customer PDF.
- Public subscriptions remain disabled with `SUBSCRIPTIONS_ENABLED=false`.
- Shop includes a real server-priced cart and authenticated order tracking. Gateway execution remains controlled by the established payment feature flags; non-payment releases do not change them.
- Production database changes are never run automatically by application startup.

## Local development

```bash
npm ci
cp .env.example .env
npx prisma generate
npm run dev
```

For a disposable local database, create a separate PostgreSQL database and point only the local process to it. Do not use destructive Prisma commands against production.

## Core modules

- **Authentication:** local email/password, secure sessions, Google OAuth, and six-digit email OTP verification.
- **Astrology:** internal sidereal calculation engine, D1/D9, Panchang, Vimshottari Dasha, Chalit, basic yoga/dosha analysis, numerology, tarot, matching, and verification-gated advanced transit modules.
- **AI Astrologer:** Gemini-backed English/Hindi/Hinglish chat with explicit consent and fail-closed provider handling.
- **Premium reports:** server-owned pricing, Razorpay payment binding, generated PDF storage, protected download, admin delivery workflow, and Resend transactional delivery.
- **Consultations:** approved astrologer profiles, availability validation, serializable collision protection, booking records, Razorpay-linked payment state, and transactional booking email.
- **Shop:** searchable catalogue, cart, authenticated order requests and owner-managed fulfilment tracking.
- **Operations:** health/release/readiness endpoints, structured safe logging, production acceptance workflow, Vercel production health cron, DB baseline rehearsal, and evidence artifacts.

## Important environment variables

Use `.env.example` as the base and keep secrets outside source control.

```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="use-a-random-32-plus-character-secret"
NEXT_PUBLIC_APP_URL="https://www.naksharix.com"
NEXTAUTH_URL="https://www.naksharix.com"
ASTROLOGY_PROVIDER="own_engine"

AI_ASTROLOGER_ENABLED="true"
AI_REPORT_GENERATOR_ENABLED="false"
ALLOW_AI_DIAGNOSTICS="false"
SUBSCRIPTIONS_ENABLED="false"
GEMINI_MODEL="gemini-3.5-flash"
GEMINI_API_KEY=""

EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.resend.com"
SMTP_PORT="465"
SMTP_USER="resend"
SMTP_PASS=""
SMTP_FROM="Naksharix Care <care@naksharix.com>"

RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""

REDIS_URL=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_SITE_VERIFICATION=""
NEXT_PUBLIC_GA_ID=""
SENTRY_DSN=""
```

Never commit real values for passwords, API keys, OAuth secrets, database credentials, email credentials, payment secrets, or monitoring DSNs.

## Production database safety

The production database may predate Prisma migration history. Therefore:

- never run `prisma migrate dev` against production;
- never run `prisma migrate reset` against production;
- never run destructive `prisma db push` against production;
- never blindly apply generated baseline SQL;
- never mark migrations applied before schema introspection, backup evidence, restore rehearsal, drift review, and explicit approval.

Application startup is migration-free:

```bash
npm run start:prod
```

The migration command is deliberately named to require reviewed use:

```bash
npm run db:deploy:reviewed-only
```

Before any production migration adoption, run the read-only audit using an explicitly supplied production `DATABASE_URL`:

```bash
npm run qa:prod-db-readonly
```

The repository also contains `.github/workflows/database-baseline-rehearsal.yml`, which generates and applies baseline SQL only to disposable PostgreSQL and records drift evidence.

## Verification

Primary local checks:

```bash
npm run qa:all
npm run qa:final-closure
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=high
```

CI additionally runs browser QA and production-safety checks. Production pushes to the authoritative branch run the custom-domain acceptance workflow, which checks exact release SHA, TLS/security headers, health/database state, AI readiness, email readiness, locked feature scope, public routes, robots, and sitemap.

`vercel.json` registers a production-only daily health cron at `/api/cron/production-health`. It validates database connectivity, Redis error state, email readiness, AI readiness, and the locked disabled-feature scope, and returns HTTP 503 when degraded so the invocation is visible in Vercel production logs/observability. This is deployment-owned and does not depend on GitHub's default branch.

## Search and analytics

- `GOOGLE_SITE_VERIFICATION` is rendered through Next.js metadata when configured.
- Google Analytics is optional and only enabled when `NEXT_PUBLIC_GA_ID` exists.
- The configured client tracking excludes URL query strings from `page_location`, anonymizes IP, disables Google Signals, and disables ad-personalization signals.
- Do not add birth details, report contents, payment data, OTPs, secrets, or private questions to analytics events.

## Email

Transactional OTP, report-delivery, consultation, and notification email uses the Resend HTTPS Email API through one shared server-only service. The existing `SMTP_*` environment names are retained as a compatibility contract so the already-configured production values do not need to be renamed: `SMTP_HOST` must be `smtp.resend.com`, `SMTP_USER` must be `resend`, and `SMTP_PASS` holds the Resend API key. The application itself does not require Nodemailer at runtime.

The sender is controlled by the single `SMTP_FROM` production variable and is intended to remain:

```text
Naksharix Care <care@naksharix.com>
```

The application never stores raw OTP values. OTPs use a keyed HMAC digest, expiration, attempt limits, invalidation on resend, and one-time consumption.

## Mobile app

`mobile-app/` is an Expo companion application aligned with the locked web product scope. It provides production links to active Naksharix experiences and does not advertise inactive subscriptions, placeholder ads, or a separate mobile payment implementation.

```bash
cd mobile-app
npm ci
npm run doctor
npm run build:android:production
```

Publishing to Google Play still requires the owner's Google/Expo account authorization and store review.

## Operational endpoints

- `/api/health` — application/database/Redis health.
- `/api/release` — non-sensitive deployment identity.
- `/api/ops/readiness` — non-secret production capability/readiness summary.
- `/api/cron/production-health` — production cron health verdict.
- `/api/ai/status` — AI Astrologer enabled/ready state.

## Production ownership boundaries

The repository can implement and test code, but these external proofs still require the relevant account owner when applicable: DNS/DMARC changes, Search Console ownership, Neon backup/restore operations, third-party alerting credentials, Google Play publishing, and real mailbox/device acceptance. Secrets must never be pasted into source code, GitHub comments, logs, or chat.

## Current operational acceptance

The authenticated `/admin/operations` screen separates consented aggregate pageviews from business records and displays independent recovery status. Aggregate analytics is opt-in; private routes, URL query strings, visitor identifiers and birth/question data are excluded. Retention is 90 days.

Deployment-owned daily recovery uses the existing production-health cron, a protected `CRON_SECRET`, an AES-256-GCM key, private Blob storage and a disposable PostgreSQL restore environment. Export is read-only; only encrypted archives leave the temporary worker. Archive retention is seven days. `/api/ops/backup-status` reports a fresh verified receipt, not merely configuration. No backup is operational until the first real run and receipt succeed. Preserve the offline recovery key separately from Vercel.
