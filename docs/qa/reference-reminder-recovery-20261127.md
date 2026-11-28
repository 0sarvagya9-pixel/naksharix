# Reference reminder recovery — 2026-11-27

## Scope and observed defect

This batch continues from immutable source `15784f5`. The baseline browser run accepted a response for `wrong-order` as a successful scheduled reminder for the selected `synthetic-order`. The request body and displayed success were captured by the baseline mode of `scripts/qa-reference-reminder-locale.mjs`.

The customer workspace now validates the account envelope and acknowledges scheduling only when the returned nonempty identity, order, event, civil date, lead time, exact due time and scheduled state match the requested reminder. Cancellation requires the explicit boolean `canceled: true`. Unknown reads remain unknown; uncertain changes require a verified refresh and renewed consent. A synchronous mutation guard blocks same-turn duplicate submission, and superseded reads cannot overwrite a newer account response. Existing cancellation remains available while new scheduling is unavailable.

English, Hindi and Hinglish cover private page metadata, controls, consent, statuses and safe errors. Hindi labels reuse the existing reviewed event translations for all 59 catalogue entries. No event date, source or accepted reference convention changes.

The worker reads the saved account locale when composing its subject and plain text. It still uses the verified private account recipient, existing recipient digest, exact consent version, paid entitlement, due window, capacity gate and idempotency key. Provider acceptance remains distinct from a verified inbox receipt; uncertain transport is never reported as delivery. No real message was sent during qualification.

## Fresh evidence

Run from the repository root with the installed Playwright Chromium:

```sh
node scripts/qa-reference-reminder-locale.mjs
REMINDER_UI_BASELINE=15784f5 node scripts/qa-reference-reminder-locale.mjs
node --experimental-strip-types scripts/qa-digital-package-contract.mjs
node_modules/.bin/tsc --noEmit --incremental false
```

The main qualification completed **162 behavioral cases**: **122 actual Chromium component cases**, **7 private-page SSR/metadata cases**, **17 actual route/schema cases** and **16 actual worker/intercepted-mail cases**. An additional catalogue assertion verified Hindi labels for all 59 reviewed events. Browser cases execute the real component, language provider and CSRF implementation with isolated HTTP transport; they do not use a substitute state machine. Route cases execute the real Zod schema and handler with isolated account and storage operations. Worker cases execute the real recovery worker and compose its actual email payload while replacing the transport with an in-memory recorder.

Worker evidence covers English, Hindi, Hinglish and unsupported-locale fallback; accepted, declined/unknown and thrown transports; changed recipient; wrong consent; revoked entitlement; and disabled service. None of the invalid-gate cases calls transport. Browser coverage includes malformed envelopes, identity mismatches, HTTP failures, invalid JSON, network loss, single-submit guards, stale reads, changing the choice after consent and localized recovery states.

Evidence captured for the integration handoff:

- `evidence/ai-reminder-recovery/reminder-combined-final.log`
- `evidence/ai-reminder-recovery/reminder-baseline.log`
- `evidence/ai-reminder-recovery/reminder-digital-contract.log`
- `evidence/ai-reminder-recovery/reminder-typecheck-final.log`
- `evidence/ai-reminder-recovery/reminder-lint-final.log`

The combined run, existing digital-package contract, full TypeScript check and scoped ESLint passed. Earlier environment and diagnostic runs are retained separately and do not supply these success counts.

## Remaining acceptance

This proves local engineering behavior with intercepted delivery. It does not constitute independent native-language review, official inbox receipt, production activation, a real purchased entitlement or real reminder delivery. Those acceptance requirements remain open until their own evidence exists. This batch does not change the original requirement denominator or close A44 globally.
