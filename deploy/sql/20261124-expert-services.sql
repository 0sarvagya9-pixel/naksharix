-- Additive migration, source only. Do not apply during deployment hold.
ALTER TYPE public."PaymentPurpose" ADD VALUE IF NOT EXISTS 'EXPERT_SERVICE';
BEGIN;
CREATE TABLE IF NOT EXISTS public."ExpertServiceRequest" (
 "id" TEXT PRIMARY KEY,"userId" TEXT NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "clientIntent" TEXT NOT NULL,"kind" TEXT NOT NULL CHECK ("kind" IN ('WRITTEN','REPORT_REVIEW')),
 "question" TEXT NOT NULL,"language" TEXT NOT NULL CHECK("language" IN ('en','hi','hinglish')),
 "sourceReportId" TEXT,"sourceChecksum" TEXT,"consentVersion" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'REQUESTED' CHECK("status" IN ('REQUESTED','ASSIGNED','QUOTED','PAYMENT_PENDING','PAID','DELIVERED','REVIEW','REFUNDED','CANCELED')),
 "astrologerProfileId" TEXT REFERENCES public."AstrologerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE,
 "quoteVersion" INTEGER NOT NULL DEFAULT 0,"pricePaise" INTEGER CHECK("pricePaise" BETWEEN 100 AND 10000000),"expertFeePaise" INTEGER CHECK("expertFeePaise">=0 AND "expertFeePaise"<="pricePaise"),
 "dueAt" TIMESTAMP(3),"providerAcceptedAt" TIMESTAMP(3),"paymentId" TEXT UNIQUE REFERENCES public."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE,
 "sourceReadAt" TIMESTAMP(3),"sourceReadChecksum" TEXT,"response" TEXT,"completedAt" TIMESTAMP(3),
 "settlementStatus" TEXT NOT NULL DEFAULT 'NOT_EARNED' CHECK("settlementStatus" IN ('NOT_EARNED','PAYABLE','SETTLED','REVIEW','REVOKED')),
 "settlementReference" TEXT UNIQUE,"settledAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(("kind"='REPORT_REVIEW' AND "sourceReportId" IS NOT NULL AND "sourceChecksum" IS NOT NULL) OR ("kind"='WRITTEN' AND "sourceReportId" IS NULL AND "sourceChecksum" IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS "ExpertServiceRequest_userId_clientIntent_key" ON public."ExpertServiceRequest"("userId","clientIntent");
CREATE INDEX IF NOT EXISTS "ExpertServiceRequest_userId_status_idx" ON public."ExpertServiceRequest"("userId","status");
CREATE INDEX IF NOT EXISTS "ExpertServiceRequest_astrologerProfileId_status_idx" ON public."ExpertServiceRequest"("astrologerProfileId","status");
CREATE INDEX IF NOT EXISTS "ExpertServiceRequest_status_createdAt_idx" ON public."ExpertServiceRequest"("status","createdAt");
COMMIT;
