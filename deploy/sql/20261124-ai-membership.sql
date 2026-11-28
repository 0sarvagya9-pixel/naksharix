-- Additive source only. Apply after AI credit ledger migration and explicit release approval.
ALTER TYPE public."PaymentPurpose" ADD VALUE IF NOT EXISTS 'AI_MEMBERSHIP';
BEGIN;
ALTER TABLE public."AiCreditGrant" ADD COLUMN IF NOT EXISTS "validFrom" TIMESTAMP(3), ADD COLUMN IF NOT EXISTS "validUntil" TIMESTAMP(3);
CREATE TABLE IF NOT EXISTS public."AiMembership"(
 "id" TEXT PRIMARY KEY,"userId" TEXT NOT NULL REFERENCES public."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "clientIntent" TEXT NOT NULL,"version" TEXT NOT NULL,"planId" TEXT NOT NULL,"pricePaise" INT NOT NULL CHECK("pricePaise" BETWEEN 100 AND 1000000),
 "unitsPerCycle" INT NOT NULL CHECK("unitsPerCycle" BETWEEN 1 AND 500),"totalCycles" INT NOT NULL CHECK("totalCycles" BETWEEN 2 AND 12),
 "approvedModel" TEXT NOT NULL,"termsVersion" TEXT NOT NULL,"liveMode" BOOLEAN NOT NULL,
 "providerSubscriptionId" TEXT UNIQUE,"hostedUrl" TEXT,
 "state" TEXT NOT NULL DEFAULT 'CREATING' CHECK("state" IN ('CREATING','AWAITING_AUTHORIZATION','ACTIVE','PENDING','HALTED','CANCEL_PENDING','CANCELED','COMPLETED','EXPIRED','REVIEW')),
 "providerState" TEXT,"lastProviderCheckedAt" TIMESTAMP(3),"cancellationRequestedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "AiMembership_userId_clientIntent_key" ON public."AiMembership"("userId","clientIntent");
CREATE INDEX IF NOT EXISTS "AiMembership_userId_state_idx" ON public."AiMembership"("userId","state");
CREATE TABLE IF NOT EXISTS public."AiMembershipCycle"(
 "id" TEXT PRIMARY KEY,"membershipId" TEXT NOT NULL REFERENCES public."AiMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "cycleNumber" INT NOT NULL CHECK("cycleNumber" BETWEEN 1 AND 12),"periodStart" TIMESTAMP(3) NOT NULL,"periodEnd" TIMESTAMP(3) NOT NULL,
 "providerInvoiceId" TEXT UNIQUE NOT NULL,"paymentId" TEXT UNIQUE NOT NULL REFERENCES public."Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CHECK("periodEnd">"periodStart")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AiMembershipCycle_membershipId_cycleNumber_key" ON public."AiMembershipCycle"("membershipId","cycleNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "AiMembershipCycle_membershipId_periodStart_key" ON public."AiMembershipCycle"("membershipId","periodStart");
CREATE INDEX IF NOT EXISTS "AiMembershipCycle_membershipId_periodEnd_idx" ON public."AiMembershipCycle"("membershipId","periodEnd");
COMMIT;
