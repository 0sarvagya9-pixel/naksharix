# Shipping and Shop catalogue admin recovery — 27 November 2026

## Verified baseline defects

The actual components from immutable `15784f5` were mounted in Chromium with isolated synthetic infrastructure. Four probe groups reproduced these failures:

- A shipping PUT acknowledgement for the wrong rate ID still claimed success, and two same-turn submits issued two PUT requests.
- The initial unresolved shipping GET displayed the empty-rate statement.
- The catalogue displayed editable seed products before its authoritative GET completed.
- Editing an English name overwrote the independent Hindi and Hinglish names. A mismatched saved catalogue version still claimed the product had been updated.

The baseline output is produced by `SHOP_ADMIN_BASELINE=15784f5 node scripts/qa-shop-admin-ui.mjs`. These are fresh reproductions, not results recovered from the lost temporary workspace.

## Completed behavior

### Authoritative reads and acknowledgements

Both controls begin without fabricated saved rows. Missing or malformed registry data is unavailable; it is not shown as an empty successful read. A verified version-zero catalogue explicitly identifies the seed state as having no saved revision yet.

Shipping receipts must contain the matching existing ID (or a new nonempty ID for creation), next version, country, exact product, postal region, integer-paise charges, maximum quantity, carrier, evidence, duties, expiry and publication state. Catalogue receipts must contain the next version and the entire expected product set, including unchanged products, authored languages, custom prices and notes. HTTP 200 alone is insufficient.

Synchronous refs guard duplicate mutations and prevent a same-turn Save followed by Refresh from starting a GET during the mutation. Sequenced reads prevent an older GET from overwriting a saved mutation or a newer refresh. Ambiguous responses/network failures and version conflicts require an explicit verified refresh before another mutation. Definite validation rejections retain an editable draft so the operator can correct it; server errors are mapped to bounded localized messages.

### Language and authored content

Controls, errors, confirmation dialogs and private page titles are available in English, Hindi and Hinglish. The catalogue editor has a separate content-language selector. Editing one authored language leaves the other language values intact. Changing a product name no longer replaces its independently authored image description. New blank language fields stay blank; the UI does not invent translations.

The existing explicit missing-market-price action changes only eligible missing numeric prices. Existing custom prices and authored price notes remain intact. Restoring the seed catalogue remains a distinct explicit confirmation that discloses replacement of custom content and prices. No such operation was run against a real store.

Image rights and evidence controls remain available. Changing a main image clears its previous rights/evidence selection, and changing a gallery URL clears the previous evidence reference. Licensed reference photos remain distinguished from actual inventory photographs.

### Shipping constraints and time

All rate data changes reset the human verification checkbox. Integer-paise amounts are derived from explicit decimal inputs. Expiry entry and display use Asia/Kolkata regardless of browser timezone. Existing seconds and milliseconds survive an unchanged edit, avoiding silent expiry truncation.

The shipping GET adds the existing authored three-language name object while retaining the English `name` field. Shipping PUT still uses the original role, product-price, destination-policy, evidence, expiry, confirmation, audit and version guards. The catalogue API's schema, image-rights checks, uniqueness checks, integer-paise limits and transactional version compare-and-swap were not changed. No migration, market-price seed change, payment activation or actual carrier approval was made.

## Fresh verification

| Gate | Observed result | Meaning |
| --- | --- | --- |
| `qa-shop-admin-ui.mjs` | **141 passed** | Actual shipping/catalogue components, language provider, authored-language controls and exact response readers in Chromium. Includes unknown-vs-empty, malformed receipts, duplicate submits, Save→Refresh ordering, delayed/out-of-order GETs, recoverable validation errors, create paths, custom-price/note preservation, approval reset, IST and expiry precision. |
| `qa-shop-admin-contracts.mjs` | **43 passed** | **35** actual route/schema/photo/price/courier/version checks plus **8** actual localized private-page/role checks. |
| Immutable baseline probes | Reproduced | Wrong rate success/duplicate PUT, unknown shipping as empty, unverified seed editing, language overwrite and wrong catalogue version success. |
| Full TypeScript | Passed | `tsc --noEmit`, exit 0. |
| Targeted ESLint | Passed | Changed source and maintained scripts, exit 0. |
| Market-price source guard | Passed | Existing twelve seed prices and custom-price merge safeguards. |
| International-shipping source/runtime guard | Passed | Existing postal, quote, immutable-snapshot and no-seeded-tariff rules. |
| Visual source guard | Passed | Existing customer checkout and image-rights integration. |

The shared `qa-shop-photo-rights.mjs` has only its Shop admin dictionary bindings updated here. On this child baseline the full shared script reaches the separate pre-existing `ACCESSIBLE_CUSTOMER_RATINGS_MISSING` literal assertion. The parent integration already has the independent rating-guard repair; the complete shared script must be verified on that integrated branch. Its result is not claimed as passed here.

The 184 new scoped checks use intercepted network, dialogs, identity, database and transaction adapters. They execute the actual components, handlers, schemas and readers but do not certify real PostgreSQL concurrency, supplier authorization, courier tariffs, stock, payment capture, native-language editorial quality or production deployment. No real store content, price, rate, order, payment or external message was changed. These engineering receipts do not promote any of the original 102 commercial requirements automatically.

## Maintained commands

```sh
node scripts/qa-shop-admin-ui.mjs
node scripts/qa-shop-admin-contracts.mjs
SHOP_ADMIN_BASELINE=15784f5 node scripts/qa-shop-admin-ui.mjs
node --experimental-strip-types scripts/qa-shop-market-pricing.mjs
node --experimental-strip-types scripts/qa-country-shipping.mjs
node scripts/qa-visual-refresh.mjs
```

Set `PLAYWRIGHT_BROWSERS_PATH` when Chromium is installed in a nondefault cache. The browser harness runs with America/Los_Angeles as its device timezone while checking IST rate input/output.
