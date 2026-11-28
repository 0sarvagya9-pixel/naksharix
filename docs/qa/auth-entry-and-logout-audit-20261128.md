# Authentication boundary audit and repair — 28 November 2026

## Scope and identity

The owner requested deployment of completed work, full website testing and an audit containing only newly discovered deficiencies. The audit recovered source `ab0bfdc57de0d60de35fc01296d24411be9ede80`. The baseline register reconciliation found neither concrete defect below in the original 102 requirements, 80 finding mappings or existing provider-control evidence. They are linked to existing authentication/security areas without counting them as closure of an original business requirement.

Only synthetic local credentials, in-memory persistence and request/cookie adapters were used. Actual installed Auth.js core and, for logout, its server signout action ran. No production login attempts, provider network requests, customer data or configuration mutations were used in these reproductions. A separate metadata-only observation confirmed that production has ADMIN_EMAIL and ADMIN_PASSWORD configured; secret values were not read.

## NEW-SEC-01 — alternate admin callback lacked the shared password quota

**Impact:** High. The custom `/api/auth/login` route enforces the durable `login-ip` counter, eight attempts per 60 seconds. Auth.js also exposes `/api/auth/callback/admin-credentials`, and the original `auth.ts` authorization callback did not claim that counter before comparing the administrator password.

**Before:** The actual installed `@auth/core` request processor executed all 12 wrong-password authorizations from the same synthetic client, with zero quota calls or HTTP 429 results. A subsequent valid synthetic credential issued an Auth.js session. This demonstrates a missing admission control, not a successful guess or a live attack. The repaired regression, run against immutable baseline `auth.ts`, fails its eight-comparison assertion.

**Repair:** `authorize(credentials, request)` now uses the existing `claimPublicAuthQuota` and `trustedPublicClientIp`, with exactly the same `login-ip`, limit eight and 60-second window as the custom handler. It does so before credential comparison and account upsert. A counter failure propagates through Auth.js error handling and fails closed. No new schema, Redis dependency or credential format is introduced. Auth.js keeps its existing generic credential-failure redirect; admission denial need not use the custom route's HTTP 429 envelope to prevent password evaluation.

**Verification:** `npm run qa:authjs-login-quota` executes 37 checks through actual Auth.js processing, the actual shared-quota implementation and the actual custom login handler. It verifies eight comparisons from 12 requests, both directions of shared counting, a fresh CSRF/browser session, an untrusted forwarded-header change, a counter outage, a separate client's valid login, and expiry of the original 60-second window. Persistence is a synthetic serial in-memory adapter; the existing PostgreSQL concurrency tests retain ownership of distributed atomicity acceptance.

## NEW-SEC-02 — practitioner logout retained an Auth.js session

**Impact:** High for shared-device session privacy. `AstrologerLogoutButton` relies on `/api/auth/logout`; that route originally revoked only the legacy session and cookie. Unlike the global account menu, the practitioner button does not call client Auth.js `signOut`. Thus a provider signed in via Auth.js could receive a successful logout acknowledgement while `getCurrentUser()` still authenticated through the Auth.js fallback.

**Before:** The actual Auth.js processor generated a valid practitioner-mode session with two secure cookie chunks. The immutable logout handler returned HTTP 200 and `{loggedOut:true}`. Both Auth.js chunks remained, and the actual `getCurrentUser()` remained authenticated. The new regression fails on this baseline.

**Repair:** The shared server logout handler also awaits the existing Auth.js server `signOut({redirect:false})`. Auth.js clears its configured secure cookie chunks; no guessed names or manual chunk deletion are used. The handler confirms success only after legacy revocation/cookie clearing and Auth.js signout complete. Errors return the existing generic API error envelope. Existing client signout calls remain safe because no-session signout is idempotent.

**Verification:** `npm run qa:dual-session-logout` executes 32 checks using the installed Auth.js core, installed server signout action, actual application logout handler and `getCurrentUser`. It covers Auth.js-only, legacy-only, both session families, no session, repeated logout, actual secure chunked cookies, a signout failure without a success receipt, and explicit recovery. Next.js request headers/cookies and persistence are isolated adapters; this does not replace deployed-browser acceptance.

The provider-route regression now requires the additional Auth.js signout operation in its existing logout contract. Both new suites are included in `qa:all`; the independent manifest grows from 88 to 90 entries. The CI runner derives its entries from that manifest and retains every existing suite.

## Acceptance boundaries

The two locally reproduced defects are repaired and regression-tested. Exact published-source CI and production post-deployment browser checks must be recorded separately. Neither fix establishes numerical astrology qualification, independent human report approval, real merchant-to-inbox acceptance, or broad security certification. Those previously recorded matters are not new audit findings.
