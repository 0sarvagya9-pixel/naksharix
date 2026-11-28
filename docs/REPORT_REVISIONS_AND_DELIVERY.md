# Paid report corrections and delivery

## Customer and operator workflow

A verified paid report opens its private status page from the account dashboard or the delivery email. When the original PDF exists, or the request is awaiting missing details, its owner can submit corrected inputs using the report-specific form. The server revalidates the input, the exact report SKU, purchase purpose, account ownership and the current payment against recorded refund receipts. Saved-chart unlocks and payments earmarked for a different request cannot authorize a personalized report.

The original request records version 1. Subsequent proposals receive a version number under a database lock, and the same normalized proposal returns its existing version. Only one proposal per request may await approval or generation. The customer sees review status on the private report page. An administrator opens the report detail screen, reviews the revised data, enters review notes and approves or declines. Approval uses the same calculation, report generation and quality checks as a paid specialist report. A failed generation returns to pending review. A worker may reclaim an interrupted generation after its lease expires.

Ready versions have separate storage keys or database bytes, SHA-256 checksums and authenticated download endpoints. A version download checks the current paying account, confirms the checksum and PDF length, and rechecks entitlement after reading the bytes. The original PDF remains in its existing storage location with its original checksum. Receipt of a refund removes paid download access to all versions.

A version publishes to the private account before its notification is attempted. The notification contains a sign-in link to the account report and a version-specific idempotency key. A recorded provider message ID confirms provider acceptance. Inbox receipt requires separate mailbox evidence. An administrator can retry a pending version email from the review screen. An uncertain attempt past the safety window requires provider reconciliation.

## Deployment and rollback

1. Verify the release revision, production backup receipt and independent restore before the authorized migration.
2. Apply `deploy/sql/20261126-report-revisions.sql` before deploying this code. The additive table stores private corrected inputs, review metadata and versioned PDF storage information. The foreign key removes versions when the parent is deleted. The customer and administrator pages read this table.
3. Regenerate the Prisma client for the target schema. Run the isolated worker and version tests against a disposable database.
4. On application rollback, roll back the code and retain the table and immutable versions. Review pending or interrupted sends before retrying. Dropping the table discards correction and delivery evidence.

## Reproducible checks

From the repository root, run the following with the standard CI configuration pointing at the disposable `localhost:5432/naksharix` database.

```sh
npx prisma db execute --schema=prisma/schema.prisma --file deploy/sql/20261126-report-revisions.sql
npx prisma db execute --schema=prisma/schema.prisma --file deploy/sql/20261126-report-revisions.sql
node scripts/qa-report-delivery-races.mjs
node scripts/qa-automatic-report-delivery.mjs --database
```

The first test uses real route handlers, Prisma, PostgreSQL, generation and PDF parsing with synthetic identities and a local email transport. It tests admin delivery concurrency, guarded state edits, expired ambiguous sends, byte-identical provider requests across worker/admin retries, private recipient checks, missing provider receipts, SKU context, correction duplicate suppression, a rendered version, version-specific email receipts, original-byte preservation, account scope and revocation. The worker test covers simultaneous generation, retry without regeneration and both unpaid and recorded-refund exclusions.

The provider replay window and response receipt follow Resend's documented API. The application's 23-hour cutoff allows margin inside the provider's 24-hour window. [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys) · [Send Email](https://resend.com/docs/api-reference/emails/send-email)
