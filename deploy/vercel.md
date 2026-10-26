# Vercel production release — review-only operator guide

**Do not deploy from this pre-deploy preparation phase.**
For the evidence-gated single cutover, read
`docs/PREDEPLOY_SINGLE_CUTOVER_HANDOFF_20261026.md` first.

## Project
- Vercel project: existing `naksharix` (no account or team switch)
- Framework: Next.js
- Install: `npm ci`
- Build: `prisma generate && next build`
- Output: `.next`; deploy only the protected, exact checked Git SHA.
- Production hostname: `www.naksharix.com`; keep the prior deployment ID
  and alias mapping recorded for independent rollback.

## Service env (values never printed into evidence)
- `DATABASE_URL`, `DIRECT_URL` (current production DB connections)
- `NEXTAUTH_SECRET`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`
- `ASTROLOGY_PROVIDER` (never mock in production)
- `GEMINI_API_KEY` iff `AI_ASTROLOGER_ENABLED=true`
- Existing transactional email provider-specific credentials when enabled.
- Existing `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` when OAuth is enabled.
- `REDIS_URL` only when provisioned and independently load-tested;
  its absence means shared rate limits are NOT certified.
- Monitoring must have an actual SDK, transport and alert probe; a configured
  `SENTRY_DSN` alone does not prove central monitoring.

**Payment remains deferred.** Razorpay, Stripe, subscriptions and product
checkout keys are NOT prerequisites to this approved non-payment cutover.
Do not create or rotate payment secrets simply to satisfy a stale guide.

Strict boolean flags use lower-case string values `true` or `false`:
- `AI_ASTROLOGER_ENABLED` only true with real tested provider
- `AI_REPORT_GENERATOR_ENABLED=false`
- `ALLOW_AI_DIAGNOSTICS=false`
- `SUBSCRIPTIONS_ENABLED=false`

## Schema rollout MUST precede production alias switch
Never auto-run production schema changes from the Next.js build or startup.
This repository is not assumed to possess a compatible complete Prisma migration
history for the existing production Neon instance. Avoid generic
`prisma db push` or `prisma migrate deploy` against production without
independent baseline reconciliation.

1. Approve a verified backup with actual restore proof on a separate DB.
2. Review read-only catalog evidence, drift, FK constraints and data safety.
3. Independently approve the pinned SQL under `deploy/sql/20261026-*.sql`.
4. Execute only the reviewed migration as an explicit controlled DB change.
5. Repeat `npm run qa:prod-db-readonly` and schema readiness:
   `LearningProgress` and `PujaPartner` tables/indexes must PASS.
6. Only then authorize one exact-SHA Vercel production deployment, test
   `/api/release`, `/api/health`, `/api/ops/readiness`,
   real account, lessons, puja/partner, report and consultation flows.
7. Fail closed and preserve old alias on any blocker.

All automated CI database writes target disposable localhost PostgreSQL only.
Production migrations, deploy and alias switch have NOT been executed here.
