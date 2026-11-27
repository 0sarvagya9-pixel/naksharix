# AI chat recovery — 2026-11-27

## Observed baseline and change

The immutable `15784f5` component was mounted in Chromium with two submit events in the same JavaScript turn and an isolated 503 response. It issued **two requests**, lost the draft question and displayed the server's `RAW_PRIVATE_ERROR` verbatim. The baseline mode in `scripts/qa-ai-chat-recovery.mjs` reproduces those three observations.

The actual chat now locks synchronously before a request, restores an unsuccessful question to the message box and removes only that pending user entry from conversation history. Manual retry therefore sends the restored question once. It validates a nonempty answer and requires `creditUsed` to match the explicitly chosen free or paid mode. Unconfirmed responses never become an assistant message. User-facing notices use English, Hindi or Hinglish copy without forwarding raw server or provider error text.

Paid selection remains consent for one answer. It resets and refreshes the actual credit account after that attempt, with no automatic retry or switch from free to paid. Uncertain paid outcomes direct the customer to the refreshed balance and payment history without asserting whether a credit was consumed. Input, suggestions and clear-chat remain locked while the attempt is in progress. Provider answers remain fully visible, while outbound history entries respect the existing 2,000-character API bound and memory respects its existing 3,500-character bound.

The API, ledger, provider adapter, free quota enforcement and feature gates are unchanged by this batch.

## Fresh qualification

```sh
node scripts/qa-ai-chat-recovery.mjs
AI_CHAT_BASELINE=15784f5 node scripts/qa-ai-chat-recovery.mjs
node --experimental-strip-types scripts/qa-ai-credit-contract.mjs
node_modules/.bin/tsc --noEmit --incremental false
```

The fresh combined qualification passed **157 cases**:

- **105 actual Chromium cases**: real chat, credit controls, language provider and CSRF implementation; three locales; free and paid mode; consent, duplicate submits, eight error statuses, malformed successes, invalid JSON, network interruption, manual retry, context bounds, loading controls and locale changes.
- **52 actual API cases**: real route, Zod validation, sanitizer, language mapping, parser, feature status and Gemini provider adapter. Account, credit ledger and quota stores are isolated, and the provider adapter's HTTP transport is intercepted with synthetic responses. Cases cover pre-provider gates, malformed input, unavailable credits, unresolved reservations, successful debit acknowledgement, failed completion, provider failure and release, and Redis/DB free quota choice.

No model inference, provider network request, real account mutation or credit use occurred. The interception never delegates to the real network implementation.

The existing AI credit contract, full TypeScript check and scoped ESLint passed. The separate baseline run reproduced the original defects. Evidence for integration is under `evidence/ai-reminder-recovery/`:

- `chat-combined.log`
- `chat-baseline.log`
- `chat-credit-contract.log`
- `chat-typecheck.log`
- `chat-lint.log`

Earlier harness diagnostics are retained separately and do not supply these pass counts. The local cases do not constitute production model readiness, live payment acceptance or independent native-language review.
