BEGIN;
CREATE TABLE IF NOT EXISTS "ReportCheckoutDraft" (
  "paymentId" TEXT PRIMARY KEY REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "inputDigest" TEXT NOT NULL,
  "fields" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "ReportCheckoutDraft_expiresAt_idx" ON "ReportCheckoutDraft"("expiresAt");
COMMIT;
