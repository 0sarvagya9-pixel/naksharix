# Razorpay sandbox acceptance — no live charges

Owner authorization on 25 November 2026 covers test-mode operations only. This standalone probe does not import production application code or access the database. Default execution uses mocked transport and cannot reach Razorpay. Only the explicit --provider-test-order flag with separate securely injected test credentials and the exact confirmation value enables an actual test API request.

Configure NAKSHARIX_RAZORPAY_TEST_KEY_ID, NAKSHARIX_RAZORPAY_TEST_KEY_SECRET and NAKSHARIX_RAZORPAY_TEST_CONFIRM (test-mode-only) in an authorized isolated local/CI secret store, not source, chat or command history. Never reuse production environment variables. Run: node scripts/qa-razorpay-sandbox-provider.mjs --provider-test-order. This creates exactly one simulated INR 1 order and reads it back; it does not attempt a payment or refund. A lost network response is ambiguous; check the test dashboard before repeating. The tool never prints secret values or raw provider response bodies. A provider order creation/readback is not capture, webhook, refund, settlement or delivery acceptance. Those require separate test-mode checkout and signed events on a disposable database; no live charges or activation permitted.

Run isolated contract assertions: node scripts/qa-razorpay-sandbox-provider.mjs --self-test.
