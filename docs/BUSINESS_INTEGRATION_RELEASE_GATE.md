# Contracted B2B astrology integration — development hold
B2B_INTEGRATION_ENABLED defaults false. No real tenant, key, contract, provider call, price, invoice or deployment created. Additive database migration source must be rehearsed before owner-authorized release.
## Actual implementation
- Owner-admin approval for an existing verified customer and a real signed contract reference; explicit scope, licensed display brand, expiry, monthly attempt-unit limit and agreed completed-unit rate. No automatic commercial approval.
- Tenant-isolated workspace: one-time opaque server API secret, HMAC at rest, expiry up to 90 days, five active keys, subset scopes, immediate revocation. Admin revocation disables all keys. No raw secret returned in list or stored in database.
- POST /api/partner/v1/calculate, Authorization: Bearer nxk_... ; exact CSRF exemption only for bearer endpoint; cookie-based user/admin endpoints retain CSRF. No broad CORS or browser-embedded keys.
- Chart, Panchang, Ashtakoot and escaped server-rendered Panchang widget. Chart/matching inputs use coordinates and explicit UTC offset, no names or contact details, permission required. No subject data or result payload retained by usage ledger. No prediction or externally certified claim.
- UTC monthly attempt quota, idempotent request ID, serialized per-tenant claim, immutable rate snapshot, completed/failed counts and estimated charge statement. Failed or interrupted requests consume attempt quota, not completed billable units. No recurring charge, automatic invoice, merchant settlement or tax claim.
## Acceptance still required
- Actual signed licensed contracts, data-processing agreements, merchant/tax decisions; test all authorization and isolation, concurrent quotas, revoked/expired key during calculation, duplicate IDs, malformed input, cross-tenant reads, logs and browser credentials.
- Real independent calculation accuracy including near-boundary labels; no claim of professional certification.
- Professional SaaS tenant report generation, custom domain/brand asset licensing, paid recurring billing and signed-origin browser widget remain separate incomplete capabilities. Current widget is server-rendered HTML only, with attribution and no script, cross-origin key or iframe relaxation.
