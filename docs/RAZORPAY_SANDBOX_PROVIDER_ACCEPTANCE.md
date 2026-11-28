# Razorpay sandbox acceptance — no live charges

Owner authorization on 25 November 2026 covers test-mode operations only. This standalone probe does not import production application code or access the database. Default execution uses mocked transport and cannot reach Razorpay. Only the explicit --provider-test-order flag with separate securely injected test credentials and the exact confirmation value enables an actual test API request.

Configure NAKSHARIX_RAZORPAY_TEST_KEY_ID, NAKSHARIX_RAZORPAY_TEST_KEY_SECRET and NAKSHARIX_RAZORPAY_TEST_CONFIRM (test-mode-only) in an authorized isolated local/CI secret store, not source, chat or command history. Never reuse production environment variables. Run: node scripts/qa-razorpay-sandbox-provider.mjs --provider-test-order. This creates exactly one simulated INR 1 order and reads it back; it does not attempt a payment or refund. A lost network response is ambiguous; check the test dashboard before repeating. The tool never prints secret values or raw provider response bodies. A provider order creation/readback is not capture, webhook, refund, settlement or delivery acceptance. Those require separate test-mode checkout and signed events on a disposable database; no live charges or activation permitted.

Run isolated contract assertions: node scripts/qa-razorpay-sandbox-provider.mjs --self-test.

## Redacted evidence and the protected workflow

The protected workflow remains limited to the existing development-hold branch, the intended repository, and the first run attempt. It checks repository/inherited test secrets, then only already-existing protected development/test/sandbox/staging/preview environments. It does not create an environment, remove protection, reuse production variables, or deploy. Provider mutation is limited to one order probe from the repository scope or the sole eligible protected environment when repository credentials are unavailable.

Set `NAKSHARIX_RAZORPAY_TEST_EVIDENCE_DIR` to a private local output directory when a local run needs durable evidence. The workflow sets its own directory and retains redacted JSON artifacts for 14 days:

| Receipt | Meaning |
| --- | --- |
| `availability.json` / `BLOCKED_TEST_CONFIGURATION` | One or more required dedicated test values are absent, invalid, or ineligible. No payment acceptance is established. |
| `availability.json` / `CONFIGURED_NOT_EXECUTED` | Dedicated test configuration passed validation. This is configuration evidence only. |
| `environment-discovery.json` | HTTP status, scanned count and eligible count from the protected-environment lookup. A lookup error is not treated as an empty successful inventory. |
| `provider-order.json` / `TEST_ORDER_CREATE_READBACK_ONLY` | The exact INR 1 test order was created and read back in its unattempted state. IDs are represented by SHA-256 digests. No payment was captured. |
| `error.json` / `NOT_QUALIFIED` | A controlled error category; no raw provider body, credential, authorization header, or stack trace. |

Each receipt explicitly records `fullMerchantToInboxAccepted:false`. A successful Actions conclusion does not override this. Match the receipt's source SHA and run ID to the reviewed candidate. Existing output files are not overwritten; an existing provider-order receipt causes the CLI to stop before another order request. Ambiguous provider outcomes require reconciliation in the Test dashboard before any repeat.

## Full merchant-to-inbox acceptance prerequisites

The order-only probe cannot qualify capture, signed events, purchased entitlement, report delivery, or refund. Complete the following setup in an authorized isolated environment before the full lifecycle. Never paste secret values into chat, code, logs, or command arguments.

| Required input | Exact binding / acceptance condition |
| --- | --- |
| Test merchant credentials | The three dedicated `NAKSHARIX_RAZORPAY_TEST_*` inputs above must pass the guarded probe. The key ID must match `rzp_test_...`. |
| Isolated application runtime | Use the exact candidate source with a disposable database containing fictional users and report inputs. `DATABASE_URL`, optional `DIRECT_URL`, `JWT_SECRET`, and `NEXT_PUBLIC_APP_URL` must belong to this isolated runtime. Never load the production environment file. |
| Runtime payment adapter | In that process only, inject the validated test key ID into `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`, and its matching test secret into `RAZORPAY_KEY_SECRET`. This is a mapping in an isolated process, not a change to deployed Vercel settings. |
| Signed test webhook | A separately configured test webhook must reach the isolated `/api/payments/razorpay/webhook` endpoint. Inject its distinct secret as `RAZORPAY_WEBHOOK_SECRET`. Do not reuse the live webhook or sign a fixture and call it provider-originated evidence. |
| Report generation | Use `ASTROLOGY_PROVIDER=own_engine`, `REPORT_STORAGE_DRIVER=database`, and `AUTO_REPORT_DELIVERY_ENABLED=true` only in the disposable environment. Source prices and SKU/purpose mappings from `lib/reports/checkout-catalogue.ts` and `lib/paid-reports.ts`; the INR 1 probe is not a report purchase. |
| Owner identity and destination | Resolve the existing authorized `EMAIL_QA_RECIPIENT` securely. A test customer must be verified and use that same approved address for a real report receipt. A connected Gmail address or an earlier operational alert alone does not prove it is the configured acceptance recipient. |
| Authorized mail transport | Securely provide the authorized sender transport only in the isolated runtime. The current adapter accepts `EMAIL_PROVIDER=smtp` and `SMTP_*` compatibility inputs but delivers through the Resend API. An accepted provider reference and actual mailbox receipt remain separate evidence. |

No production environment change, production migration, public activation, paid infrastructure, or new customer outreach is part of this acceptance.

## Execution and evidence sequence

1. Record the candidate SHA, runtime URL, disposable database identity, exact SKU/price/currency, fictional profile, and securely resolved owner-recipient scope. Record configuration presence without recording values.
2. Use the real authenticated report intake and preflight flow. Submit `/api/payments/razorpay/order` with the resulting context; do not insert a PAID row. Retain the real test order's binding to the report and owner account.
3. Complete Razorpay **Test mode** Checkout with an official test instrument. Verify the returned order/payment association and captured state against the provider. A created order alone is insufficient. [Razorpay Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/).
4. Submit the genuine checkout signature through `/api/payments/razorpay/verify` and receive the genuine signed test capture webhook. The application must verify raw-body signatures, fresh capture/amount/currency, owner binding, and current ledger eligibility. Record each result without exposing signatures or secrets.
5. Replay the already-recorded test event to the same disposable endpoint and exercise out-of-order failure/capture delivery. Exactly one eligible paid entitlement must remain, with no duplicate paid benefit or report. Razorpay documents duplicate and out-of-order webhook delivery; preserve the raw body for signature verification. [Webhook validation](https://razorpay.com/docs/webhooks/validate-test/).
6. Allow the real worker to generate the PDF and persist it privately. Record report/input/PDF checksums, generation history, current payment entitlement, and worker outcome. Do not mark a mocked provider row as merchant proof.
7. Verify authenticated owner download, PDF integrity, `private, no-store`, and refusal for an unauthenticated or distinct foreign account. The email must contain the account link, never a public bearer link or sensitive birth details.
8. For the actual authorized report send, retain the provider message reference and its report/recipient binding. Read the matching message in the authorized mailbox; record message date, matching subject/reference, inbox/spam placement, and SPF/DKIM/DMARC results. A 2xx response, an unrelated alert, or the synthetic 11-category admin suite does not close report delivery.
9. Refund only the captured **test** payment from this run. Bind amount and currency to that payment, retain provider refund state, and process its genuine signed refund event. Reconcile an ambiguous response before repeating. [Razorpay normal refunds](https://razorpay.com/docs/api/refunds/create-normal/).
10. Verify refunded access is denied, duplicate/stale capture does not restore entitlement, and replay does not resend the report. Exercise the already-supported recovery path in the disposable environment and preserve truthful pending/uncertain outcomes. This lifecycle recovery is separate from production encrypted-backup restore acceptance.
11. Remove only this run's disposable fixtures after retaining redacted receipts. Reconcile test merchant records instead of deleting evidence. Record independent pass/block/fail outcomes for every step and mark full acceptance only when all required stages have genuine evidence.

## Available isolated engineering checks

`node scripts/qa-email-acceptance-receipts.mjs` executes the actual admin route, response reader and Resend adapter with intercepted identity/database/provider boundaries. It checks receipt validity, exact server-owned destination, uncertain responses, durable per-message audits and send guards. It sends no email.

`node scripts/qa-deferred-controls-routes.mjs` and `node scripts/qa-deferred-controls-ui.mjs` qualify authenticated controls and localized operator outcomes. Browser dependencies are installed separately by `scripts/install-browser-qa-tools.sh` in CI.

`scripts/qa-report-delivery-matrix.mjs` exercises actual PostgreSQL/worker/private-storage/download behavior for 15 SKUs in three languages, with synthetic paid states and intercepted mail. Its guards require the dedicated local CI database. It must never be relabeled as real payment or inbox acceptance.
