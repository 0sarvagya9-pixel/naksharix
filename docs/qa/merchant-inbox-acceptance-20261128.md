# Merchant-to-inbox continuation — 28 November 2026

## Scope and disposition

Continued from source `f4bccdf832c25de43ef8eeddeaaa746702006b9a`. The original commercial acceptance remains **OPEN**. This change repairs receipt integrity and makes the next guarded payment configuration probe independently reviewable. No new actual email, provider order, captured payment, refund, production configuration change, deployment, or database migration was performed during these local checks.

## Repaired acceptance behavior

- The admin email route now requires a valid provider reference from the actual adapter before it records acceptance. A malformed/empty 2xx provider response is uncertain, not a successful send.
- Single-mode fallback to `EMAIL_QA_RECIPIENT` now uses the correct destination source in the attempt audit, outcome audit, API receipt and all three interface languages.
- The client requires a valid provider message reference for a single success and every accepted suite outcome. Missing/wrong recipient-source bindings and contradictory uncertainty are refused.
- Each suite message is audited before the next send; a later audit failure preserves earlier evidence and stops subsequent sends. The aggregate receipt separately records counts. Every outcome records `inboxVerified:false`.
- A partially uncertain suite shows its uncertainty explicitly and holds further send controls for reconciliation. Existing admin authorization, strict server-owned destinations, serialized database quotas, idempotency keys and duplicate-click guards are retained.
- The guarded Razorpay workflow retains sanitized availability, protected-environment discovery, order-only or controlled-failure JSON artifacts. It preserves the original branch, repository, first-attempt and protected-environment gates; no provider call is permitted by a readiness failure.

The existing Resend provider label is correct: `lib/email/email-service.ts` uses SMTP compatibility configuration but calls the Resend API. No transport migration was made.

## Verification

| Verification | Observed result | Scope |
| --- | --- | --- |
| Receipt regression before repair | 11 passed, 16 failed in the original 27 cases | Isolated real-source regression; failures reproduced before route repair |
| Expanded strict receipt regression | **48/48 passed** | Actual route, adapter, Zod/API and client reader; identity/database/provider HTTP intercepted |
| Deferred route/page regression | **82 route + 27 page cases passed** | Actual handlers/contracts; persistence, sends and restore workers intercepted |
| Deferred browser regression | **225/225 passed**, English/Hindi/Hinglish | Actual five React controls, isolated HTTP; 15 receipt/mailbox/uncertainty cases added to the 210-case baseline |
| Delivery checks | **12/12 passed** | Existing delivery and send-guard source checks |
| Nonpayment engineering checks | **PASS** | Existing owner-only email suite, other operational guard checks |
| Razorpay probe self-test | **24/24 passed** | Injected synthetic transport, zero provider network calls |
| Changed TypeScript/TSX ESLint | **PASS** | Route, client, copy, UI |
| Protected workflow YAML | **Parsed successfully** | Both jobs and original guard structure retained |

These case counts describe engineering checks, not newly closed master-register requirements or independent human acceptance.

## External observations and their limits

On 28 November, the connected Vercel project metadata listed 41 environment entries and zero hidden production entries. None of the three dedicated `NAKSHARIX_RAZORPAY_TEST_*` variables was present. The project reported no custom environments. Existing generic Razorpay entries target production/preview and were not decrypted or reused. `EMAIL_QA_RECIPIENT` exists as a sensitive production-scoped value; the single-variable read still returned it undecrypted, so its exact destination was not inferred.

The recovered protected GitHub run `45814945507` is dated **26 November**, source `79ed30ff806a3a588afd5997bcb638df9687a779`: all three dedicated inputs were absent, no eligible protected development environment was found, and provider execution was skipped. This historical result does **not** establish current GitHub configuration. The meaningful workflow change in this candidate is intended to obtain a fresh first-attempt branch-triggered receipt after publication. Its source SHA/run ID and actual outcome must be recorded separately.

The connected owner mailbox contains an existing 27 November operational recovery-failure notice from the configured NAKSHARIX sender in **INBOX**, with SPF, DKIM and DMARC pass in its authentication header. This proves that particular alert arrived. It proves neither a purchased-report receipt nor a successful recovery. The exact search for `NAKSHARIX REAL EMAIL TEST` from that sender returned no matching message. No new acceptance message was sent during this review.

## Remaining external acceptance

The required secure configuration, real test Checkout/capture, signed-event replay, paid report generation/download, actual owner-inbox binding and test-refund/recovery evidence are specified in [the sandbox acceptance runbook](../RAZORPAY_SANDBOX_PROVIDER_ACCEPTANCE.md). All existing scope restrictions remain in force. The entire merchant-to-inbox requirement stays open until those genuine provider and mailbox receipts exist.
