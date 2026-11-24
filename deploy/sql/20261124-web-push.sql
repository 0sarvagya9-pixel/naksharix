-- Source only; additive migration, not applied. Keep push disabled until explicit approval.
BEGIN;
CREATE TABLE IF NOT EXISTS public."WebPushSubscription" (
 "id" TEXT PRIMARY KEY,
 "userId" TEXT NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "endpointDigest" TEXT NOT NULL UNIQUE,
 "endpointCiphertext" TEXT NOT NULL,
 "keyFingerprint" TEXT NOT NULL,
 "consentVersion" TEXT NOT NULL,
 "lastAcceptedAt" TIMESTAMP(3),
 "lastOutcome" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "WebPushSubscription_userId_createdAt_idx" ON public."WebPushSubscription"("userId","createdAt");
COMMIT;
