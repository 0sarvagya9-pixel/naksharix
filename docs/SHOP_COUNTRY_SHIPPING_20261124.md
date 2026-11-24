# Country-aware physical shipping

India is the default country. The existing domestic standard-shipping-included policy remains unchanged. Digital reports, consultation and Puja stay outside physical shipping.

The server validates the selected country and postal code. The submitted quote key must match the canonical quote recomputed from catalogue prices, selected SKUs, quantities and matching unexpired merchant-approved rates.

The owner can publish verified rates in /admin/shop-shipping for exact products, country, optional postal prefix, maximum quantity and separately packed per-unit charges in INR, explicit checkout tax, customs treatment, carrier evidence reference and expiry. The most-specific valid region wins. Missing or expired rates for any item result in a quote request, with no payment collected. No estimated or invented international tariffs are seeded.

The owner can record a verified manual quote under Shop Orders. Customers must review the exact accepted total and customs terms before payment. Accepted quotes are immutable snapshots until renewed; expired quotes cannot initiate new payments. Already-issued gateway orders must be honoured at their original amount and reconciled before changing or canceling the quote. Payment reservation and administrative quote mutations share a transaction-scoped lock.

Apply only the add-only SQL migration to the verified production database before deploying the new Prisma client. Existing India records retain their totals. Tests use disposable fixtures, never real payments or shipments. International payment acceptance, courier serviceability, customs obligations and real fulfilment remain separately verifiable.
