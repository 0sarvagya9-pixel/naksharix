-- SOURCE ONLY. NEVER automatically run against production Neon.
-- Preconditions: verified production backup/restore, schema drift review, operator approval.
-- Add-only learning progress. It is not a certificate, examination or payment record.
BEGIN;
CREATE TABLE IF NOT EXISTS public."LearningProgress" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LearningProgress_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES public."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "LearningProgress_userId_lessonId_key"
  ON public."LearningProgress"("userId", "lessonId");
CREATE INDEX IF NOT EXISTS "LearningProgress_userId_completedAt_idx"
  ON public."LearningProgress"("userId", "completedAt");
COMMIT;
