# Business workspace language and acknowledgement acceptance — 2026-11-26

## Bounded source scope

The customer business workspace and business-contract administration previously displayed English headings, controls, status, usage statements, confirmations and error strings in every selected language. Server page metadata was also English-only. Raw API error text could appear directly in the UI, and HTTP 200 alone could acknowledge a revoked key/tenant or an approved contract.

The repaired scope is:

- `components/business-workspace.tsx`, including its live heading, key controls, usage table and integration instructions.
- `components/admin-business-integrations.tsx`, including its live heading, explicit owner-confirmation form and revocation flow.
- Their two server page wrappers and cookie-based metadata.
- `components/admin-portal-sidebar.tsx` navigation labels and accessible names.
- Shared, typed English, Hindi and Hinglish copy in `lib/business-integrations/workspace-copy.ts`.

Other administration page bodies are outside this change. The server-branded chart reference PDF remains the separately approved English/ASCII capability; the interface now describes that boundary in all three languages. This is not a translation of that product or a new commercial capability.

## Behavior preserved and checked

API paths, payload field names, scope codes, prices, integer paise, unit limits, `ACTIVE`/`REVOKED` storage states and the existing owner confirmation remain unchanged. Authorization, admission, expiry, key limits and revocation still run in their existing server code. No database or payment implementation was modified.

Displayed messages are keys resolved through the current language context, so a visible success/error notice changes language without performing the operation again. Dates are explicitly shown in UTC. Technical request examples and machine-readable scope identifiers retain their contract spelling.

Key issuance displays a returned secret only when its parsed identity and returned key record match the submitted label/scopes. Approval requires a returned active tenant with the submitted business names, scope set, unit allowance and rate. Revocation requires an explicit `revoked: true` acknowledgement. Missing/mismatched acknowledgements remain unconfirmed. Synchronous guards prevent two same-turn submits from issuing duplicate mutations. Unknown server error text is replaced by a localized recovery message; known contract, authorization and rate-limit failures retain an actionable explanation.

## Reproducible verification

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/scratch/f1fce8ed7944/runtime-scratch/playwright-browsers node scripts/qa-business-workspace-ui.mjs
```

**66 isolated Chromium scenarios passed across English, Hindi and Hinglish.** The harness loads the actual page wrappers, client components, shared dictionaries and `LanguageProvider`. It verifies headings, cookie-based metadata, changing language after a status, field labels, disabled contracts with revocation still available, owner confirmation, unchanged numeric/scoped mutation payloads, one-time key copy/hide, malformed acknowledgements, authorization/rate-limit failures and translated confirmation dialogs. No browser page errors were observed.

Adding `BUSINESS_UI_BASELINE=48bddbd` reproduces the original failure: the Hindi workspace displays the English heading. Focused ESLint, full `tsc --noEmit --incremental false`, existing B2B scope/matching contracts and the 40-case request-boundary suite passed after the change.

The existing browser CI environment already provides the harness dependencies through its isolated Playwright 1.54.1 installation and the application's React 18/TypeScript packages. The CI invocation is `node scripts/qa-business-workspace-ui.mjs`; no new dependencies are required.

## Evidence boundary

The harness isolates authorization, HTTP transport and clipboard operations and intercepts all browser network requests. The synthetic key has no real tenant or permission. These checks do not prove a real contract, invoicing, billing, partner/publisher integration, production accessibility or native-language editorial approval. Full A44 and R30–R34 acceptance remains subject to those original requirements and the remaining implementation documented in `BUSINESS_INTEGRATION_RELEASE_GATE.md`.
