# Owner release hold — 24 November 2026

Production base: adbcd7e9c14a4bfe15f1f8ad829c1afe9f366204. Development branch: internal-naksharix-development-hold-20261124.
No production or preview deployment, merge, activation, live test charge, migration or production DB write without new explicit owner approval. Branch-specific Vercel automatic deployment is disabled. Existing 52 audit items and 35 revenue opportunities are in scope; implementation is NOT declared complete. Proposed new prices and bundles are not live offers. Final production acceptance requires separate authorization.

## First implementation batch (source staged; no new test result claimed until execution)
- Replace seeded public calculator values with the existing computed birth-chart provider; require date/time/location/timezone; suppress made-up single-person relationship percentages.
- Replace legacy matchmaking endpoint with actual chart-based Ashtakoot rules, preserving old API shape and labeling percentages as traditional Guna proportions.
- Replace fixed Muhurat with computed Delhi reference; make date dynamic and label noon-sampled lunar values correctly. Independent ephemeris certification remains outstanding.
- Fix civil-time offset resolution: UTC, valid offsets, IANA DST, ambiguous and nonexistent local clock times; invalid zone no longer silently falls back to IST.
- Remove state-changing Google callback GET; add explicit professional application confirmation and atomic role/profile mutation. Preserve pending-review and payment guardrails.
- Preserve original safe checkout route through OTP and Google next parameter; preselect professional signup; password reveal and main auth heading semantics.
- Extend isolated regression assertions, including name invariance and real engine provenance. Do not treat these authored tests as PASS.

## Unclosed scope
Audit 01 backup receipt and 05 legacy paid Puja: read-only root-cause and operator/provider reconciliation; do not rewrite historical payment evidence or claim successful backup.
Audit 07 secure password reset, 12 verification funnel, 14 multilingual auth, 15 reconciliation/retry, 16 preflight, 17–22 product copy/samples/live delivery/independent accuracy/annual rollover, 23–29 provider/fulfilment/push, 30–39 SEO/analytics/consent/marketing, 40–52 UI/mobile/ops/accessibility and true end-to-end acceptance: remain in backlog. Existing PRs 144,151,153 must be reconciled on the development branch without releasing.
All 35 business opportunities from audit are requested for development, gated by actual calculation reliability, consent, provider/fulfilment contracts, approved pricing, costs, legal/tax and verified payment capability. Do not create inactive-looking fake offers, fake practitioners, claims of guaranteed predictions, paid provider usage, or deploy any component during this hold.

## Second implementation batch (source-only; acceptance pending)
- Password recovery uses a separate high-entropy, expiring, hashed one-time token with per-IP/destination quota, verified nonprivileged password account eligibility, generic request responses, atomic consumption/password update/session revocation, no live email tests. OAuth JWT invalidation references the reset receipt. No production schema migration is required by this change. New signup/reset passwords cannot exceed bcrypt's 72-byte boundary; legacy sign-in remains compatible. Added private noindex recovery screens and regression contract tests. Email delivery, database race and browser E2E remain to be independently tested. Protected-route return now preserves the query string.

## Third implementation batch
- Reconciled all five changed files from exact PR #153 head 091defc9 onto the isolated development branch using exact patch context. Added product-specific summaries to the catalogue too, not just individual details. Price source, automatic delivery, and Puja request-only gates preserved. No production merge. Original PR remains open; release must account for this integration rather than double-applying it.

## Fourth implementation batch
- Integrated exact PR #151 consent registry, verified-account opt-in and withdrawal, additive SQL and disposable tests. No production migration, campaign or contact import. Sending-provider suppression acceptance remains mandatory. Original draft PR remains unmerged.

## Fifth implementation batch
- Reconciled PR #144's public partnership page, private authenticated enquiries, catalogue/contact links and regression checks. Retained the newer production CI isolation workflow instead of replacing it with older browser dependency hunks. No partner onboarding, referral payout, contact spam or production release. Original PR remains unmerged.
