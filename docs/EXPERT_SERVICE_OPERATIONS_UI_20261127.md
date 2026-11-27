# Expert service operational controls — recovered verification

Date: 2026-11-27. Source checkpoint before this repair: `15784f59e61b0a3da9a1b924e651b2ee1abbb2a3`.

## What changed

The actual customer, practitioner and admin components now use verified response identities before displaying success. Practitioner and admin responses must acknowledge the exact request ID and action. Customer creation must acknowledge the original client intent and submitted kind, language, question and source report. Cancellation must acknowledge the selected ID. The API additions are emitted only after the existing ledger operation reports success; the owner-only quote and settlement restrictions are unchanged.

Provider and admin controls, private-page titles, status messages and recovery instructions have English, Hindi and Hinglish copy. Practitioner terms are bound to the actual assignment, including quote version, fee and deadline. An edited written answer requires renewed human-review confirmation. Admin edits to the practitioner, price, fee, deadline or settlement reference clear earlier confirmation. Localized textareas and selects have stable accessible names. Deadlines display in Asia/Kolkata; the admin deadline editor explicitly identifies device-local input time.

Synchronous locks stop duplicate mutations in the same event turn. Refresh sequence numbers prevent superseded reads from updating state. Malformed or failed registry responses display unavailability rather than an empty list. Uncertain writes retain the entered information and require readback before further provider/admin changes. Customer retry retains its original idempotency intent even after refresh; refreshed payment terms need renewed consent. Existing source-report authorization, entitlement checks, report-review prerequisites and payment gates remain in the ledger.

## Fresh evidence

The following commands ran from the recovered worktree using an isolated Chromium transport and synthetic identities. No real request, quote, approval, payment, delivery, email or settlement was performed.

| Check | Result |
| --- | --- |
| Baseline component reproduction at `15784f5` | A response for a different request/action was accepted as saved; two same-turn clicks sent two PATCH requests. |
| `node scripts/qa-expert-operations-ui.mjs` | 114 actual component/private-page cases across English, Hindi and Hinglish passed. |
| Route section of the same suite | 16 cases passed against the actual handlers and Zod schemas, with isolated authentication and ledger dependencies. |
| `npm run qa:expert-services-contract` | Existing expert-service contract and provider source-revocation fixtures passed. |
| Scoped ESLint | Exit 0; zero errors and three cleanup-ref-pattern warnings. |
| Full project `tsc --noEmit` | Passed after correcting the response guard's TypeScript narrowing; the failed attempt was retained separately. |
| `git diff --check` | Passed. |

The browser suite covers duplicate operations, wrong/missing acknowledgements, consent invalidation after edits and refresh, protected report-review prerequisites, known-state rendering, localized metadata, private role checks and preservation of the customer's original retry intent. Route tests verify additive acknowledgements and that missing roles, non-owner operations, invalid input, unavailable schemas and rejected ledger operations cannot become successful responses.

The shared component harness now uses an intercepted localhost origin so native `crypto.randomUUID()` is available; UUID creation is not replaced or weakened. All external requests are blocked. Source checkpoints can be loaded with `EXPERT_UI_BASELINE=15784f5` for a reproducible failure.

Evidence receipts: `expert-recovery-before.log`, `expert-recovery-ui.log`, `expert-recovery-contract.log`, `expert-recovery-final-lint.log`, and `course-expert-editorial-final-typecheck.log`. Early harness/call attempts are retained separately and are not counted as passes.

## Acceptance boundary

These checks establish the repaired component, page and response-contract behavior. They do not constitute actual-practitioner acceptance, a live private-report download, gateway settlement, customer inbox delivery, production migration verification or independent professional review. Those existing release requirements remain open until their own evidence is recorded. This change does not enable expert sales or alter the approved Royal report corpus.
