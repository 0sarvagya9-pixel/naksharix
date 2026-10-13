# NAKSHARIX — world-class launch acceptance register

Baseline source: \`complete-production-polish\` at \`618a9ce9a1ef17a0f69b919c2ac24e8f2be007d0\`.
Scope: existing product plus its approved safe future enhancements.
This file is a **durable checkpoint**, not a claim of 100% completion.
Only mark a requirement PASS when there is current, exact-SHA evidence.

## Permanent locks
- Do not alter the accepted public design or site identity without explicit approval.
- Shop stays enquiry-only, with no product cart or automatic checkout.
- Public subscriptions and AI report generator stay disabled.
- Preserve Gemini AI Astrologer approved settings and the Razorpay payment architecture.
- Preserve all production Neon data; no reset, unreviewed migration, or unapproved destructive SQL.
- Never auto-link a local password account to Google solely by matching email.
- Do not switch GitHub/Vercel accounts or production aliases without current authority.

## P0 controls (must pass before promotion)
| Gate | Evidence required | Current |
| --- | --- | --- |
| Legacy OAuth CSRF/state | Legacy code-exchange path disabled; NextAuth Google login tested | Code fix proposed in this PR; E2E pending |
| Slot exclusivity | Concurrent pending booking blocked and test run | Code fix proposed in this PR; E2E pending |
| Razorpay paid-state monotonicity | Late failure cannot downgrade paid transaction; webhook E2E | Excluded from this branch by owner instruction; provider test pending |
| Accurate public release identity | /api/release returns exact deployed SHA on both canonical hosts | FAIL: custom domain returned 404 |
| Mandatory OTP live UX | /verify-email, resend, expiry, replay, no unverified session | FAIL: /verify-email returned 404 |
| Readiness observability | /api/ops/readiness and operational alerts deployed | FAIL: endpoint returned 404 |
| Production security | session/CSRF/role isolation, rate limit, response headers, safety baseline | Partly verified in isolated CI; production not accepted |
| Production DB protection | schema drift review, restorable backup, rollback plan | NOT VERIFIED / NOT APPROVED |

## P1 complete working journeys
- User: signup -> real inbox OTP -> login and Google OAuth -> dashboard -> calculations -> saved private data.
- Astrologer: application -> admin review -> availability -> booking -> payment -> consultation -> review -> earnings -> payout request.
- Reports: payment -> authenticated request -> admin generate -> real PDF -> secure storage -> owner download -> delivered email -> retry.
- Shop: admin persistence -> public active catalogue -> image storage -> multi-admin optimistic conflict -> item-specific enquiry.
- Payment: authorized/captured/failure/refund/cancellation/retry/replayed webhook and reconciliation, with verified real-provider evidence.
- Astrology: independent astronomical fixtures for Kundli/Panchang/Dasha/Lagna/Nakshatra plus advanced Shadbala/Ashtakavarga gating.
- Quality: mobile/desktop and inner pages visual parity; WCAG 2.2 AA testing; Core Web Vitals field measurement; multi-user load testing.
- Reliability: Redis-backed distributed abuse protection, monitoring that truly delivers alerts, backups/restore and incident response.
- SEO: verified Search Console, robots/sitemap/canonical, real indexing checks; never index private reports.
- Android: real device QA, release signing, Android AAB and store review only with explicit publishing authorization.

## P2 differentiated premium features (not substitutes for P0/P1)
- Consent-based personal cosmic dashboard, saved Kundli, household profiles and reminders.
- Grounded, explainable Gemini AI Astrologer with explicit provenance and fallibility boundaries.
- User report library, request status updates and corrected report delivery.
- Professional video/audio consultation experience where privacy and consent are met.
- Shop imagery, product history and enquiry workflow CRM, without checkout.
- Accessible Hindi/Hinglish/localized experiences and account/data export controls.

## Required read-only production evidence
- Exact deployed public SHA, Vercel production target, canonical host and TLS.
- Database row-count/drift audit without writes, Neon recovery evidence and migration review.
- Redis/email/monitoring/AI readiness (status only, never secrets).
- Real provider payment, email delivery, Google OAuth and report owner acceptance.
- Independent mobile, browser, accessibility, security and performance reports.

## Latest verified boundary before this PR
- Baseline merge: PR #17 merged; CI on merge SHA succeeded.
- Vercel deployment for merge SHA is READY as a preview target, not proven live production.
- Live /api/health app/database OK, Redis skipped; /api/ai/status enabled and ready.
- Live /api/release, /api/ops/readiness and /verify-email each returned 404.
- Production Acceptance workflow failed while waiting for the exact live release.
- CI synthetic payments/reports/roles are not real Razorpay/inbox acceptance.
- Advanced Shadbala and Ashtakavarga explicitly need external validation.
- Astrologer payout and reviews portal pages still display placeholders.

## Chat interruption / recovery policy
Do **not** rely on one chat response as a source of truth.
Each accepted work unit must be committed in an isolated branch, tested in CI,
and linked to a PR plus exact SHA and PASS/FAIL evidence. After an interrupted
chat, resume from the latest verified GitHub PR HEAD, not an uncommitted claim.
Keep messages and tool outputs compact. Do not say work continues in the
background after the assistant turn ends. Avoid shipping partial production changes.
