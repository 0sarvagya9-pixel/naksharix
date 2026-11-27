# AI credits and membership customer recovery — 27 November 2026

This rebuild resumes durable source `15784f5` after the earlier temporary workspace became unavailable. Earlier local test counts are historical; the following result was executed again against this implementation.

## Defects and changes

The immutable baseline accepted a string credit balance as an account snapshot and reported that a mandate record was created for `{membership:{}}`. The maintained baseline mode records those actual rendered outcomes. The repaired customer UI validates the actual public ledger envelope, positive monetary/quantity fields, stable version and row identity before presenting an outcome. A failed or malformed read is unknown, never an empty ledger or a zero balance.

EN, Hindi and Hinglish cover the credit and membership controls, consent, expiry/renewal/cancellation terms, status, recovery text and private page metadata. Status notices follow a subsequent locale change. All dates in the membership period table explicitly use India time and its columns have explicit header scope.

Credit purchase intent survives uncertain state and existing unpaid purchases. A new intent is issued only after successful payment acknowledgement and a verified account refresh with no unresolved purchase. There is no automatic switch from free to paid mode. The actual checkout component retains its original exact payment acknowledgement and duplicate guards.

Membership creation retains the original intent across an interrupted response and requires record refresh plus renewed consent before a retry. Provider control acknowledgements require the requested row ID and immutable price/quantity/version snapshot. Cancellation is described as confirmed only for the matching recorded terminal state. Authorization URLs still use the existing Razorpay allowlist; they appear only for a known awaiting-authorization/created record and disappear while account state is unknown.

## Fresh qualification

`node scripts/qa-ai-customer-locale.mjs` passed **140 actual Chromium scenarios, 7 server page/metadata checks and 24 real route/Zod cases (171 total)**. Actual components, language provider, Razorpay checkout and CSRF client execute; network transport, identity, provider authorization and ledger decisions are isolated. The route tests exercise the real input validators and envelopes. No real payment or recurring mandate is created.

`AI_CUSTOMER_BASELINE=15784f5 node scripts/qa-ai-customer-locale.mjs` reproduces the malformed-balance and malformed-mandate defects in the old components. The repaired suite rejects these and other malformed, stale, mismatched, duplicate and unsafe-link cases.

Full TypeScript and scoped ESLint passed. Existing `qa-ai-credit-contract.mjs` and `qa-ai-membership-contract.mjs` passed. Original API, pricing, model readiness, ledger, capture, refunds, cancellation and merchant gates are unchanged. Genuine merchant sandbox lifecycle, native-language review and production acceptance remain separate requirements.
