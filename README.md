# Naksharix

Naksharix is a production Next.js astrology platform with authenticated Kundli workflows, Panchang, horoscope, numerology, tarot, matchmaking, premium digital reports, approved astrologer consultations, an opt-in Gemini-backed AI Astrologer, and an informational spiritual Shop catalogue.

## Locked production scope

- Authoritative release branch: `complete-production-polish`.
- Razorpay is the active payment provider for supported report and consultation flows.
- AI Astrologer can be enabled independently with `AI_ASTROLOGER_ENABLED=true` and a real Gemini key.
- `AI_REPORT_GENERATOR_ENABLED` remains disabled unless separately approved.
- Public subscriptions remain disabled with `SUBSCRIPTIONS_ENABLED=false`.
- Shop is informational/enquiry-only. No cart, Buy Now, stock mutation, or generic ecommerce checkout is part of the active scope.
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
- **Premium reports:** server-owned pricing, Razorpay payment binding, generated PDF storage, protected download, admin delivery workflow, and SMTP delivery.
- **Consultations:** approved astrologer profiles, availability validation, serializable collision protection, booking records, Razorpay-linked payment state, and transactional booking email.
- **Shop:** searchable spiritual catalogue and availability enquiry only.
- **Operations:** health/release/readiness endpoints, structured safe logging, production acceptance workflow, hourly production monitor, DB baseline rehearsal, and evidence artifacts.

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

Never commit real values for passwords, API keys, OAuth secrets, database credentials, SMTP credentials, payment secrets, or monitoring DSNs.

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

CI additionally runs browser QA and production-safety checks. Production pushes to the authoritative branch run the custom-domain acceptance workflow, which checks exact release SHA, TLS/security headers, health/database state, AI readiness, SMTP readiness, locked feature scope, public routes, robots, and sitemap.

An hourly GitHub Actions production monitor checks `/api/health`, `/api/release`, `/api/ops/readiness`, `robots.txt`, and `sitemap.xml`, stores evidence, and opens/updates a GitHub issue on failure.

## Search and analytics

- `GOOGLE_SITE_VERIFICATION` is rendered through Next.js metadata when configured.
- Google Analytics is optional and only enabled when `NEXT_PUBLIC_GA_ID` exists.
- The configured client tracking excludes URL query strings from `page_location`, anonymizes IP, disables Google Signals, and disables ad-personalization signals.
- Do not add birth details, report contents, payment data, OTPs, secrets, or private questions to analytics events.

## Email

SMTP is shared by OTP, report delivery, and consultation booking notifications. The sender is controlled by the single `SMTP_FROM` production variable. Current production configuration is intended to use:

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
- `/api/ai/status` — AI Astrologer enabled/ready state.

## Production ownership boundaries

The repository can implement and test code, but these external proofs still require the relevant account owner when applicable: DNS/DMARC changes, Search Console ownership, Neon backup/restore operations, third-party monitoring credentials, Google Play publishing, and real mailbox/device acceptance. Secrets must never be pasted into source code, GitHub comments, logs, or chat.
