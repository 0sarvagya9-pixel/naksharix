-- Additive reviewed migration. DO NOT APPLY until explicit owner release approval.
-- Keep sales and consumption flags off until isolated migration/restore, gateway and concurrency tests pass.
ALTER TYPE public."PaymentPurpose" ADD VALUE IF NOT EXISTS 'AI_CREDITS';
BEGIN;
CREATE TABLE IF NOT EXISTS public."AiCreditGrant" (
 "paymentId" TEXT PRIMARY KEY REFERENCES public."Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "units" INTEGER NOT NULL CHECK ("units" BETWEEN 1 AND 500),
 "remaining" INTEGER NOT NULL CHECK ("remaining" >= 0 AND "remaining" <= "units"),
 "offerVersion" TEXT NOT NULL,
 "suspendedAt" TIMESTAMP(3),
 "revokedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS public."AiCreditUse" (
 "id" TEXT PRIMARY KEY,
 "userId" TEXT NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "requestId" TEXT NOT NULL,
 "grantPaymentId" TEXT NOT NULL REFERENCES public."AiCreditGrant"("paymentId") ON DELETE CASCADE ON UPDATE CASCADE,
 "status" TEXT NOT NULL DEFAULT 'RESERVED' CHECK ("status" IN ('RESERVED','CONSUMED','RELEASED')),
 "expiresAt" TIMESTAMP(3) NOT NULL,
 "finishedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "AiCreditUse_userId_requestId_key" ON public."AiCreditUse"("userId","requestId");
CREATE INDEX IF NOT EXISTS "AiCreditUse_userId_createdAt_idx" ON public."AiCreditUse"("userId","createdAt");
CREATE INDEX IF NOT EXISTS "AiCreditUse_userId_status_expiresAt_idx" ON public."AiCreditUse"("userId","status","expiresAt");
COMMIT;
