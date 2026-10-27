-- Reviewed additive schema DDL; execute ONLY after production backup verification.
-- This is a new opt-in table. No existing data is changed.
CREATE TABLE IF NOT EXISTS "PujaOffering" (
  "topicId" TEXT NOT NULL,
  "pricePaise" INTEGER,
  "durationMinutes" INTEGER,
  "available" BOOLEAN NOT NULL DEFAULT FALSE,
  "note" TEXT NOT NULL DEFAULT '',
  "updatedBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PujaOffering_pkey" PRIMARY KEY ("topicId")
);
