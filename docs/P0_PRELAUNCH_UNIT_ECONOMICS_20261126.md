# P0 pre-launch unit economics — 2026-11-26

Baseline 0a1ac04: all seven GitHub workflows and 85/85 QA manifest commands passed. P0 full acceptance remains open.

Owner clarified that no genuine paying report customers have arrived; realized profitability, actual settlement fees and actual customer delivery evidence belong after launch. The existing published prices are preserved. This is a planning model, not financial statements, actual invoices, tax determination or permission to spend.

## Sources and assumptions
- Canonical catalogue and server checkout price mapping: read directly from existing source, all 15 unique SKU IDs. No live price updates.
- Razorpay public standard rate 2% plus 18% GST on the fee (2.36% total); listed higher-rate instruments 3% plus GST (3.54%). https://razorpay.com/solutions/e-commerce/ and https://razorpay.com/pricing/?preferred-country=IN . Actual merchant contract, credits, international acceptance and settlement may differ.
- Resend public free allowance 3,000 messages/month and 100/day; other usage and account plan unknown. https://resend.com/pricing . Do not assign all email overhead to reports or assume unused capacity.
- Vercel Hobby terms restrict commercial use. https://vercel.com/docs/plans/hobby and https://vercel.com/legal/terms . Connected team metadata did not expose the billing plan; commercial hosting eligibility must be verified before commercial release. No plan upgrade or migration authorized by this analysis.
- No actual GST registration or product tax determination is assumed. The 0% and 18% output-tax scenarios are alternative sensitivities, not legal conclusions. No input tax credit is assumed.
- Refund rates 3%, 5%, 10%; support allowance ₹25, ₹35, ₹50; compute/storage/delivery allocation ₹5, ₹10, ₹20; monthly overhead ₹2,500, ₹5,000, ₹10,000 are explicitly analyst-selected scenarios. Expert review is 0, 10 or 30 minutes at illustrative ₹0, ₹600 or ₹1,000/hour respectively. Zero review time means automated-only scenario, never permission to call a product expert-certified. All labor and overhead assumptions require actual quotes or observed records.
- Automatic report generation currently follows deterministic local calculation and PDF rendering; no separate per-token charge is assumed in these report-only examples. AI memberships or consultations require a separate model and verified tariff/usage.

## Measured planning output
- lean_automatic_no_output_gst_assumption: 15 products, 15 positive estimated contribution, 15 meet that scenario's target.
- reviewed_tax_inclusive_sensitivity: 15 products, 15 positive estimated contribution, 15 meet that scenario's target.
- stress_tax_inclusive_high_review: 15 products, 2 positive estimated contribution, 0 meet that scenario's target.

Expected retained revenue is reduced by refunds and scenario output tax; fee on original gross and incurred fulfillment costs are conservatively retained. Contribution = net revenue minus variable costs. Break-even assumes a single SKU for all orders; no sales forecast. Minimum price solves the scenario contribution target and is not a live recommendation or approval. Generated machine-readable result contains 45 SKU/scenario rows. Run the new model from repository root with an optional P0_COMMERCIAL_EVIDENCE_PATH to write JSON.

## Unchanged gates
P0-12 and P0-14 gain prelaunch sensitivity evidence, not actual cost or full commercial acceptance. Bundles, consultations, memberships, Puja and shop require separate product-specific models; do not treat absent costs as zero. P0-06 remaining independent full-strength discrepancies, P0-07 through P0-09 premium editorial quality, P0-11 actual sandbox verification, P0-13 independent 90/100 and qualified expert review remain open. No additional spend, production deployment, price change or fabricated certification.
