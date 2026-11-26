# Royal Edition generation and qualification

## Purchase and intake

A published report slug maps to its specific paid SKU and INR price in `lib/reports/checkout-catalogue.ts`. Preflight normalizes the fields required by that report. Chart-dependent products need an actual birth instant and location. The two date-and-name products use the confirmed Roman spelling and date. A matching report needs a second profile and permission. The checkout snapshot and the signed preflight identify the reviewed inputs. Private birth details stay in the private workflow. The order and correction tables have separate additive migrations under `deploy/sql/`.

## Calculation, interpretation and rendering

The paid report assembler chooses a chart or date-and-name calculation path and generates the product's own chapters. The chart path uses the internal Lahiri, whole-sign engine. The date-and-name path performs letter and civil-calendar arithmetic. Both produce the request language, calculation date, ordered sections, limitations and customer-specific interpretation. The calculation reference investigation is recorded in `P0_DATE_NAME_AND_LUNAR_BOUNDARIES_20261126.md`. The Royal renderer and fictional sample workflow are documented in `ROYAL_REPORT_RENDERER.md`.

## Acceptance before storage

`lib/reports/report-quality.ts` computes SHA-256 hashes over canonical normalized inputs and the ordered section data. The automatic worker derives the expected input hash from the paid request. Generation checks the customer name, product, language, calculation date, required chapter set and section uniqueness. It embeds a per-request receipt into the generated file and reopens the serialized PDF to check its receipt, title and A4 page structures. A quality failure sends the automatic job to `auto_quality_review`. The request history contains digests and the file checksum. The numerical reference comparisons, all-page visual proof, and professional interpretation review are separate checks.

## Delivery and correction

The worker checks paid ownership and refund evidence, uses a lease to claim work and delivers an authenticated account link to the verified recipient. A signed refund affects access to every version. Corrections produce private versions while retaining the purchased original. See `REPORT_REVISIONS_AND_DELIVERY.md` for the state changes and recovery rules.

## Reproduction

Run `node --experimental-strip-types scripts/qa-report-quality-binding.mjs` for document-binding negative cases. Run `scripts/qa-report-quality-quarantine.mjs`, `scripts/qa-report-delivery-races.mjs`, and `scripts/qa-report-sales-runtime.mjs` in the isolated PostgreSQL CI environment. The last script checks nine synthetic payment records including historical missing evidence, replay, partial refund and full refund. It rolls its fixture transaction back. `/admin/revenue` counts qualifying live captures by unique payment, exposes ambiguous paid report records for reconciliation, and displays monetary totals per currency.

The attached all-page proof checks geometry, glyph rendering and identity at the recorded revision. Commercial release still depends on calculation qualification, independent product review, provider test-mode evidence, recipient receipt, a recent verified production restore and hosting eligibility.
