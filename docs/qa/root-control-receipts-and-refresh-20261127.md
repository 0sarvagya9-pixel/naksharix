# Package retry receipts and same-turn catalogue refresh

Date: 2026-11-27. Base: `b073fe5a60b4a04e706339648d0fad3c1510cd28`.

## Confirmed defects and changes

The actual `releasePackageItem()` ledger method records `RETRY` after a failed generation releases its lease. The customer account parser previously rejected that status, so a single recoverable item made the entire package account unreadable. The parser now accepts `RETRY` alongside its existing supported statuses. Empty, differently cased and unknown states still fail validation. Attempt limits, ownership, payment entitlement, lease checks and PDF verification have not changed.

The catalogue controls invalidated refreshes that started before Save, but their public Refresh buttons relied only on React's eventual `disabled` render. Save followed immediately by Refresh could start a GET while the write was pending. A held stale response then overwrote the newly saved price or reopened controls after an unconfirmed mutation. The public Refresh handlers now check the synchronous mutation ref. Internal reloads after a confirmed partner mutation remain available while that ref is held.

The digital package public Refresh button receives the same synchronous guard. Its existing internal post-write reconciliation was already present and is preserved. The demonstrated digital defect was an additional read during the pending mutation; this review did not establish a late overwrite after its internal reconciliation.

Production changes are limited to the package account parser and the public Refresh callbacks in `DigitalPackageWorkspace`, `AdminPujaOfferEditor`, `AdminManualReportPrices`, and `AdminPujaPartners`.

## Baseline evidence

New regressions were first run against the unchanged production source at the base commit:

- In mounted Chromium, saving `1300.25` and invoking Refresh in the same JavaScript turn issued two GETs. Releasing the held stale read restored `1250.50` while the save confirmation remained visible.
- Actual `releasePackageItem()` → actual GET handler → JSON serialization → actual account parser produced a `RETRY` item that the parser rejected.
- Mounting that `RETRY` account left the Generate PDF control absent.
- After correcting only the retry parser, the unchanged digital component still started a second GET during a held generation. Its new ref guard prevents that read; the separate post-write GET still occurs.

Baseline and qualification logs are retained in the task evidence directory under `root-catalogue-race-*`, `root-package-retry-*`, `root-package-ledger-baseline.log`, and `root-package-refresh-baseline.log`.

## Qualified checks

| Maintained command / output | Cases | Scope |
| --- | ---: | --- |
| `node scripts/qa-admin-catalogue-ui.mjs` / `ADMIN_CATALOGUE_UI_PASS` | 110 | Actual mounted controls and language provider; EN, Hindi, Hinglish. Includes 12 new confirmed/uncertain Save→Refresh cases. |
| Same command / `ADMIN_CATALOGUE_SERVER_PASS` | 47 | Actual private pages, handler schemas and receipt parsers with isolated identity/persistence. |
| `node scripts/qa-digital-package-ui.mjs` / `DIGITAL_PACKAGE_UI_PASS` | 89 | Actual mounted package controls, language provider, schema and preparation. Includes RETRY visibility, five-attempt limit, same-turn draft/generation refresh and preserved post-write reconciliation in all three locales. |
| Same command / `DIGITAL_PACKAGE_SERVER_PASS` | 10 | Existing actual private page and POST handler/schema checks. |
| Same command / `DIGITAL_PACKAGE_RELEASE_READER_PASS` | 7 | Actual release ledger → GET selection → JSON → reader; wrong-owner and stale-lease release rejected; unknown item statuses rejected. |

Chromium uses `PLAYWRIGHT_BROWSERS_PATH=/tmp/naksharix-browser-cache-20261127` in this workspace. Both maintained scripts are already invoked by the existing CI workflow. These counts are the final suite counts, not extra cases to add to earlier runs.

TypeScript and Next lint were run on the scoped worktree. Lint exited successfully with existing warnings outside the changed controls and scripts; there were no lint errors. No database, provider, payment, email or real partner approval was performed by these checks. Browser transport and server persistence/identity/readiness are explicitly isolated. This is not a real PostgreSQL, merchant checkout or inbox-delivery acceptance result.

All 15 current report products use gateway pricing, so the actual manual price page exposes zero editable manual rows. Its public Refresh receives the same fix, but no synthetic manual SKU was invented to claim mounted mutation coverage.

## Read-only report control review

`ReportRequestActions` and `ReportCorrectionReview` render their navigation Refresh link only after the awaited operation enters its held state. They have no corresponding public fetch-refresh action available during the initial mutation. The exact Save→Refresh race was not found there, and those controls were not changed.

The workflow PATCH directly parses its request with `patchSchema.parse(await request.json())`; it preserves the submitted notes rather than applying the generic input sanitizer. Its exact notes receipt comparison therefore matches the actual backend contract. PDF generation and delivery receipts, correction identity/version/action receipts, Puja offer fields and partner create/review receipts were compared with their actual handlers. No further concrete receipt mismatch was found in this bounded review.

These corrections support the existing operational controls and do not close independent language review, provider delivery acceptance or wider release requirements.
