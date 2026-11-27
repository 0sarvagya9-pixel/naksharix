# Support journey recovery — 27 November 2026

Baseline: durable development commit `15784f59e61b0a3da9a1b924e651b2ee1abbb2a3`. This rebuild was necessary after the prior temporary workspace disappeared. Prior unpublished local test counts are not used as evidence for this revision.

## Changes

- Customer create success requires a nonempty recorded ticket ID, matching mutation ID, subject and initial message, and a valid public ticket shape. The exact original mutation survives an uncertain response; no automatic resend occurs.
- Customer/admin conversation success additionally requires the returned ticket ID. The HTTP acknowledgement includes that ID only after the existing append service reports a recorded reply. Duplicate replay and provider notification rules remain unchanged.
- Admin review separates editable status/priority from recorded values. An unsaved closed draft cannot hide the reply form or claim that a ticket is closed. Matching ID/status/priority and a recorded timestamp are required before changing the displayed stored state.
- Synchronous mutation guards reject two same-turn sends/saves. Unknown admin outcomes require a successful read before another review mutation. Sequence guards prevent earlier list replies from overwriting newer data. Failed reads cannot claim an empty list.
- Customer, staff and conversation controls, status/error messages and private page metadata use English, Hindi or Hinglish from the language provider. Status messages translate when the selected language changes. Dates use Asia/Kolkata.
- Customer support-reply email uses the stored account locale and email. Fixed authenticated URLs, omitted private content, provider-acceptance wording and idempotency keys are retained. The configured owner new-ticket notice remains English.

## Fresh checks

| Command | Observed result | Boundary |
|---|---:|---|
| `SUPPORT_UI_BASELINE=15784f5 node scripts/qa-support-language-ui.mjs` | Three baseline defects reproduced | Empty-ID false success, malformed-review false success and two same-turn PATCHes |
| `node scripts/qa-support-language-ui.mjs` | 114 Chromium scenarios passed | Actual client components and LanguageProvider; isolated network and presentation |
| `node scripts/qa-support-response-contracts.mjs` | 35 checks passed: 16 route, 8 private page, 11 email | Actual route handlers, schemas, metadata and email service; isolated identity/persistence/provider |
| `node scripts/qa-nonpayment-operations.mjs` | Existing operational guards passed | Notification retry budget, owner gate and no inbox-delivery assertion retained |

The existing static guard follows the localized dictionary binding and saved locale selector. Its behavioral conditions were not removed. No real support ticket, staff reply or provider email was created. Native-language reviewer approval and actual authorized mailbox receipt remain separate acceptance conditions.
