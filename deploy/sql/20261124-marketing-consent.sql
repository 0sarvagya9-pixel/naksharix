-- Additive only. Rehearse on disposable PostgreSQL before any production apply.
BEGIN;
CREATE TABLE IF NOT EXISTS public."MarketingConsent" (
  "userId" TEXT PRIMARY KEY REFERENCES public."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "emailAtConsent" TEXT NOT NULL,
  "interest" TEXT NOT NULL,
  "country" TEXT,
  "locale" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "consentVersion" TEXT NOT NULL,
  "confirmedAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "MarketingConsent_revokedAt_confirmedAt_idx" ON public."MarketingConsent" ("revokedAt", "confirmedAt");
COMMIT;
