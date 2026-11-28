# Continuation execution and open acceptance — 26 November 2026

## Result and release state

This continuation resumes the verified development checkpoint `9b84a0d` and completes the concrete implementation and regression work described below. The source remains in draft PR #158 on `internal-naksharix-development-hold-20261124`. The Vercel deployment hold, payment/service activation restrictions and original acceptance criteria remain in force.

The first published continuation commit, `f3ae8c3ca1c2b51753e443796a4e4d799b37aef5`, has exact Git tree `5078d85d85a47fa6b5befe058a82ac4303e743fc`, matching the locally qualified `cfd548d` tree. All seven PR workflows passed there, including the full source/runtime quality job and 317 passing browser cases with 10 declared skips. Subsequent customer/business language and truthful-status fixes have their own maintained regression suites. The PR Checks tab is authoritative for the latest persisted revision; historical green checks are not relabeled as a later run.

There is no production deployment, genuine provider payment, customer communication, new contract, invoice, merchant activation or expert approval in this continuation.

## Implemented repairs

| Area | Reproduced problem | Result and maintained evidence |
|---|---|---|
| Numerology | Unsupported or missing names, mixed spelling fragments and empty vowel/consonant groups generated substitute values; invalid civil dates rolled into another date | Shared declared arithmetic and strict civil inputs; explicit unavailable groups; removed legacy `Naksharix Native` 5/8/6 fallback. `qa-numerology-integrity.mjs`: 195 cases. See `P0_NUMEROLOGY_INPUT_INTEGRITY_20261126.md`. |
| Numerology views | Displayed result could follow edited rather than submitted input; daily value was recomputed differently; focused name/destiny results forced English | Accepted input/result binding, returned personal-day value and selected locale. Six actual component submissions across three languages passed with unchanged 3/9/8 values. |
| Royal PDF layout | London/Hinglish Premium Kundli exceeded the existing reference bound; a short Hindi LoShu answer ended alone on another page | Recovered and integrated the unfinished row-height repair; measured short-question/answer/disclaimer grouping with normal pagination for large questions. No body-font reduction or content truncation. See `ROYAL_PAGINATION_REGRESSION_20261126.md`. |
| Question interpretation | Unbounded `work` matching classified homework/coursework as career | Word-aware work detection and explicit study terms including गृहकार्य; ten assembled multilingual question cases passed. |
| Private email | Remaining English operational copy in localized delivery mail | Complete subject/plain text/HTML language, help/privacy copy in three languages; six deterministic retry payload fixtures; authenticated links and idempotency keys preserved. |
| Partner input | Chunked bodies were buffered before size validation | Actual streamed bytes bounded before JSON parsing, quota reservation or grant use: calculation 8 KiB, widget 4 KiB. Forty real-handler boundary assertions. See `PARTNER_REQUEST_BODY_ACCEPTANCE_20261126.md`. |
| Consultation request | English errors, unassociated labels and HTTP-200-only or mismatched acknowledgements could misstate the result | Localized accessible form, actual booking/order/payment acknowledgement checks, synchronous duplicate-submit guard and saved-booking recovery. Forty-eight Chromium cases, including 24 label checks. |
| Consultation status/access | Paid requested/rejected bookings claimed to be secured; accepted unpaid bookings or unsafe metadata URLs could expose a join link | Display follows actual booking status; accepted and confirmed headings are distinct; meeting access uses the existing payment/status conditions and validated URL reader. Dates are explicitly Asia/Kolkata. |
| Consultation review | Malformed HTTP 200 could claim a saved review; two same-turn submissions emitted two requests | Success requires a nonempty returned review ID, matching booking ID and selected rating; synchronous in-flight lock. `qa-consultation-customer-locale.mjs`: 158 checks, including 113 server renders and 45 Chromium cases. |
| Customer transaction language | English checkout/history/report/retry and notification messages, including stale language after a switch | Explicit typed EN/HI/Hinglish copy; status keys follow the current language; silent requests remain silent; explicit language changes persist the cookie before refreshing server content. Sixty-six actual Chromium cases. |
| Payment-success truth | Admin bypass claimed a payment/request; paid records implied a report request; arbitrary plan queries or non-report purposes could choose a report CTA | No-charge admin access, owned verified payment receipt, stored SKU/purpose/amount/currency/context binding, owned linked-request continuation and neutral dashboard fallback. Ninety actual server-rendering cases and existing payment contracts pass. |
| Business workspace | English customer/admin controls and malformed mutation acknowledgements could claim key/contract changes | Three-language workspace, metadata/navigation and actionable known errors; matching issued-key/approved-tenant or explicit revocation acknowledgement required. Sixty-six Chromium cases; no backend policy, rate or real contract changed. |
| Delivery regression | A shared foreign-account fixture reached the normal download limiter; fixture audits could survive cleanup | Distinct foreign accounts per SKU; actual 45-product/language worker/storage/download/refund/idempotency checks in CI; exact-ID transactional cleanup and guaranteed disconnect. No application rate limit or ownership expectation weakened. |

## Frozen report corpus

The actual report generator was frozen at local source `48bddbd62f5cfeb4902a19803150f15d013712fe`. The input manifest covers 115 source, font, artwork, lockfile and QA files. Later status-page and language-copy changes do not modify these report-generation inputs; the final owner package compares their hashes against the persisted candidate.

| Physical or scoped calculation check | Observed result |
|---|---:|
| Main corpus: 15 products × 3 languages × 3 fictional profiles | 135/135 PDFs, 2,024 pages |
| Reference fixture page range | 9–30 pages |
| Contents destinations | 1,494/1,494 |
| Profile card values | 468 |
| Viewport renders / locale phrase checks | 360 / 1,350 |
| Independently read printed facts and record values | 10,557/10,557 |
| Cross-language fact comparisons | 3,522/3,522 |
| Additional specialist checks | 1,557 across 36 PDFs |
| D9 worked examples and chart labels | 63/63 across 9 PDFs |
| Printed-lunar timestamp arithmetic | 396/396 within the stated rounding budgets |
| Personalized action cards / distinct cross-profile plans | 342 / 45 |
| Short question, answer and disclaimer co-location | 135/135 |
| Native/mixed names and empty letter-group PDFs | 12/12 |
| Long submitted question | 1,991 characters, 71 lines recovered exactly once, 18 pages |
| Mechanical multilingual screen | 3,690 candidate lines; zero unresolved; six formula exceptions |

The 4–30 page check is the existing synthetic reference-fixture regression bound. It is not a new universal product-length restriction. A separate raw-PDF index and archive checksum manifest identify all 148 delivered PDFs. The owner-review subset contains 45 PDFs and 675 pages for the first fictional profile.

The independent numerical comparator does not import the product calculations: it reads physical PDFs and uses separate arithmetic, time-zone data and Swiss Ephemeris/Moshier calculations under its declared angular tolerance. That is technical numerical comparison, not an independent practitioner's approval or proof of predictive validity. Its negative control rejects an injected single-locale discrepancy. The separate specialist and printed-lunar checks retain their own conventions and timing budgets.

## Reproduction and environment boundaries

Repository commands:

```sh
npm run qa:numerology-integrity
node scripts/qa-partner-request-boundaries.mjs
node scripts/qa-consultation-request-ui.mjs
node scripts/qa-customer-localization-ui.mjs
node scripts/qa-customer-status-pages.mjs
node scripts/qa-consultation-customer-locale.mjs
node scripts/qa-business-workspace-ui.mjs
node scripts/qa-payments.mjs
npm run lint
npm run typecheck
npm run build
```

The component/browser harnesses use the existing isolated Playwright environment configured by `scripts/install-browser-qa-tools.sh`. CI invokes them after browser setup and retains their logs. They use actual components and shared validation/copy with explicitly isolated transport, identity, database or gateway decisions. They do not submit genuine reviews or create real keys, contracts or purchases.

`node scripts/qa-report-delivery-matrix.mjs <receipt.json>` refuses execution except with `CI=true` and the disposable `localhost:5432/naksharix` database. All 45 variants passed using actual Prisma state, worker, PDF generation, stored checksums, ownership and refund checks, with the email provider transport intercepted. The cleanup assertion observed zero remaining users, payments, reports, revisions, histories and report-target audits after removing 30 synthetic users and 45 payment/report fixtures.

Local build/lint and the actual HTTP suite passed at `48bddbd` (24/24 HTTP checks). The full 86-command QA manifest passed at `be700fd` and was re-executed by the successful `f3ae8c3` GitHub quality job. The GitHub job also passed the new 45-variant cleanup matrix under Node 22. Logs retain earlier failed fixture attempts separately from repaired runs.

## Original acceptance remains unchanged

The frozen register still contains **102 original requirements: 29 COMPLETE_VERIFIED, 51 PARTIAL, 3 FAIL, 18 BLOCKED_EXTERNAL and 1 POST_LAUNCH_ACCEPTANCE**. P0 remains **10/33 complete**. Passing tests and fixed defects add evidence inside these requirements; they do not automatically satisfy an entire mandatory acceptance criterion.

### Failed method and product gates

- **P0-06 / A21:** the two original 97-cell strength charts pass 72/97 each under the recorded Raman Ayana plus seasonal-Hora comparison. Fifty of 194 cells remain outside the unchanged 0.25-virupa tolerance: ten direct component differences and forty inherited totals/house values. No expected number, method flag or tolerance was relaxed. The 30-day elapsed-calendar surrogate was rejected because it regresses untouched examples and civil-day continuity. Full supported motion/epoch/day-count and per-varga awards, nonzero Yuddha fixtures and remaining specialist acceptance are still required.
- **P0-13:** historical internal 90/100 scorecards remain provisional. The 15 reports still require genuine independent method/editorial/native-language acceptance and every other mandatory provider, design or device gate. Assistant review and automated physical readers do not supply those approvals.

### Provider and operational prerequisites

The protected Razorpay test probe recorded no eligible test-only configuration; the actual test-order step was skipped. The required configuration names are `NAKSHARIX_RAZORPAY_TEST_KEY_ID`, `NAKSHARIX_RAZORPAY_TEST_KEY_SECRET` and `NAKSHARIX_RAZORPAY_TEST_CONFIRM=test-mode-only`. No values belong in the repository or review package. The generic production/preview settings were not decrypted or reused as a sandbox.

Actual provider order/capture/refund/signed webhook/replay and authorized official-inbox receipts remain necessary. So do the current encrypted production-archive restore in permitted recovery infrastructure, genuine credentials/capacity/fulfilment for practitioners/Pandits/suppliers, documented merchant/tax/account costs, actual devices/assistive technology and owner review dispositions where required by the register.

### Source work still open

- **A44:** the repaired checkout/report/consultation/business journeys do not cover every page. `digital-package-workspace.tsx`, `paid-course-workspace.tsx`, `reference-reminder-workspace.tsx` and `admin-support-content.tsx` retain concrete English UI/error text outside the completed scope. Other administration bodies and standalone notice callers need their own inventory and translation. Independent native review and actual localized mailbox receipt remain additional gates.
- **R30:** tenant isolation, keys, quotas and estimated usage statements exist. Subscription-to-tenant mapping, invoicing, recurring billing and settlement/reconciliation remain to be implemented against actual approved commercial arrangements.
- **R31:** the small branded numerical chart reference is implemented. Full tenant-branded premium reports, licensed logo handling and verified custom-domain mapping remain to be implemented with actual approved assets and domain ownership.
- **R32–R34:** the existing calculation/matching/signed-origin runtimes and bounded input handling are technical capability. Actual contracted partner/publisher configuration, applicable billing and independent calculation acceptance remain open. See `BUSINESS_INTEGRATION_RELEASE_GATE.md`.

The updated owner register preserves every original ID, priority, requirement, status, criterion and external condition. Only the observed work, remaining work and evidence descriptions are revised. The deployment hold remains until the actual original release gates are satisfied.
