-- SOURCE-ONLY migration. Requires approved Neon backup, production schema audit
-- and explicit operator authorization; never auto-run in production.
-- There are intentionally NO partner seed rows.
BEGIN;
CREATE TABLE IF NOT EXISTS public."PujaPartner" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "traditions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "evidenceUrl" TEXT,
  "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "PujaPartner_reviewStatus_createdAt_idx"
  ON public."PujaPartner"("reviewStatus", "createdAt");
COMMIT;
