-- Additive only. Do not execute against production before explicit approval.
BEGIN;
CREATE TABLE IF NOT EXISTS public."ReferenceReminder" (
 "id" TEXT PRIMARY KEY,
 "userId" TEXT NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "orderId" TEXT NOT NULL REFERENCES public."DigitalPackageOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "eventId" TEXT NOT NULL,
 "eventDate" TEXT NOT NULL,
 "leadDays" INTEGER NOT NULL CHECK ("leadDays" IN (1,7)),
 "dueAt" TIMESTAMP(3) NOT NULL,
 "consentVersion" TEXT NOT NULL,
 "recipientDigest" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK ("status" IN ('SCHEDULED','CLAIMED','ACCEPTED','CANCELED','SKIPPED','UNKNOWN')),
 "claimedAt" TIMESTAMP(3),
 "acceptedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "ReferenceReminder_userId_eventId_key" ON public."ReferenceReminder"("userId","eventId");
CREATE INDEX IF NOT EXISTS "ReferenceReminder_status_dueAt_idx" ON public."ReferenceReminder"("status","dueAt");
CREATE INDEX IF NOT EXISTS "ReferenceReminder_orderId_idx" ON public."ReferenceReminder"("orderId");
COMMIT;
