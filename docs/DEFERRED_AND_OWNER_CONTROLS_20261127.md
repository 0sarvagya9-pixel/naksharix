# Deferred services and owner operation controls — 2026-11-27

## Result and scope

Five operational React controls and the two private deferred-service entry pages now use English, Hindi and Hinglish controls, messages, status labels and consent language. These are local engineering receipts. Original requirement A44 remains PARTIAL, and none of the original 102 requirement statuses is promoted by this batch.

The starting source was `0a68982ac00f90353f0234d818073273f940f200`. The actual baseline components reproduced all of the following defects: a wrong ticket identity was accepted as a recorded request; a different allocation was accepted as a completed acknowledgement; a planning HTTP success without any operation receipt was displayed as success; two same-event clicks sent two email POSTs and two recovery POSTs; and a recovery response without a successful-restore timestamp was displayed as verified.

## Changes

- Deferred intake uses one immutable UUID request intent across an uncertain retry. The controls retain the submitted fields and consent, require matching request identity/content and all six no-commerce flags, and clear consent after a definite rejection or input edit. The existing deterministic ticket ID, exact previous-content check, verified customer restriction, rate limit and owner feature gate remain.
- Customer proposals and admin planning require the exact acknowledged action, selected record identifiers and submitted version/operation identifiers, plus the corresponding returned record state. The API adds its acknowledgement only after the existing locked ledger succeeds. Existing planning capacities, review attestations, proposal version rules, stable lock ordering, receipt uniqueness and all seven admin actions remain.
- Proposal and planning refreshes reject malformed/duplicate records and prevent an older response from replacing a newer view. Synchronous locks prevent same-event duplicate mutations. An uncertain mutation retains the entries and requires a fresh read before another change. CREATE_PLAN and RECORD_PROGRESS reuse their intent ID when retrying the same retained input.
- The email control shows fixed diagnostic categories in the selected language. A success needs the exact mode, fixed server-owned recipient label, ordered 11-category result and consistent acceptance totals. Provider acceptance is explicitly distinct from inbox receipt. An ambiguous outcome prevents another send until the operator reviews the audit/mailbox and reloads. The existing role, ready-adapter, fixed-recipient, transaction/advisory-lock quota and pacing rules remain.
- The owner recovery control needs a fresh, nonfuture successful-restore timestamp and all existing proof flags. Confirmation authorizes one operation. Ambiguous runs remain locked even if a later status read is explicitly unverified; a run may still be active. A fresh independently readable success is accepted. The production-only handler, same-origin/CSRF boundary, actual owner authorization, maximum three UTC-day claims and isolated restore process are unchanged.
- The two deferred-service page headings, introductions and noindex metadata follow the saved language, with the existing customer/admin access and owner feature gates unchanged. Authored provider labels, reviewed references and actual diagnostic email bodies are not silently translated.

The runtime test harness resolves actual relative TypeScript imports as well as aliases. It still mounts the real components with the real language provider in Chromium and intercepts only transport/auth/page dependencies. The two legacy email guard checks now read the actual shared category/copy source after that source moved; the original semantic conditions remain.

## Fresh verification

| Check | Result | Reproducible command |
| --- | --- | --- |
| Baseline defects | Reproduced | `DEFERRED_UI_BASELINE=0a68982 node scripts/qa-deferred-controls-ui.mjs` |
| Actual mounted React controls | 204 cases, three languages | `node scripts/qa-deferred-controls-ui.mjs` |
| Actual API handlers, parser/sanitizer, schemas and owner authorization | 82 cases | `node scripts/qa-deferred-controls-routes.mjs` |
| Actual private page SSR and metadata/access gates | 27 cases, three languages | same route script |
| Full project TypeScript | Pass | `node_modules/.bin/tsc --noEmit` |
| Scoped source ESLint | Pass, zero errors and warnings | `node_modules/.bin/eslint` on the 15 changed TS/TSX files |
| Existing deferred contract | 86 checks pass | `node scripts/qa-deferred-service-contract.mjs` |
| Existing delivery, nonpayment and recovery guard suites | Pass, including the existing 8 isolated recovery-worker fixtures | `node scripts/qa-delivery.mjs`, `node scripts/qa-nonpayment-12-engineering.mjs`, `node scripts/qa-recovery-diagnostics.mjs` |

The new scoped total is **313 cases = 204 Chromium + 82 API/schema/authorization + 27 private-page SSR**. Existing guard counts are reported separately and must not be added again as new cases. Browser prerequisites follow the existing isolated component harness; local receipt runs use `PLAYWRIGHT_BROWSERS_PATH=/tmp/naksharix-browser-cache-20261127`.

Evidence directory: `/workspace/scratch/5d06e9e96c2f/evidence/`.

- `deferred-controls-before.log`
- `deferred-controls-ui-final.log`
- `deferred-controls-routes-final.log`
- `deferred-controls-typecheck-final.log`
- `deferred-controls-lint-final.log`
- `deferred-controls-existing-guards.log`

Failed attempts remain in `deferred-controls-ui-attempt1.log` and `deferred-controls-routes-attempt1.log`. They record an initial test expectation using the wrong existing consent constant and an isolated SSR harness missing the automatic JSX runtime; both harness issues were repaired, and neither failure is counted as a pass. The earlier lint report with two cleanup-ref warnings is retained as `deferred-controls-lint.log`; stable ref capture removes those warnings without changing invalidation behavior.

## Acceptance boundaries and remaining work

All persistence, email service calls and recovery worker calls in new tests are intercepted in an isolated process; none reaches production. No real email, account/device action, recovery, payment, capacity reservation, actual provider approval or commercial booking was performed. API schema and owner authorization are actual source; planning storage/ledger outputs are isolated adapters, not a new database-concurrency proof. Existing database/runtime suites remain part of integration verification.

Independent native-language review and real authorized mailbox receipt evidence remain open. The actual 11 diagnostic email bodies remain authored English. Wider dashboard/navigation/profile text and any other uncovered user journey must be reconciled against original A44 before it can be complete. Deferred services remain unpaid internal review/planning; genuine provider contracts, capacity, eligibility, fulfilment, refunds and external acceptance are still required for commercial offerings. Recovery verification remains externally unproven until the owner explicitly runs the protected operation and records its actual receipt.

Final integrated commit, remote CI and commercial release decision are owned by the parent integration batch and are not asserted by this local checkpoint.
