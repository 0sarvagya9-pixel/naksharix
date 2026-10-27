-- Additive Puja booking request table, deploy only after reviewed backup/restore.
CREATE TABLE IF NOT EXISTS "PujaBookingRequest" (
 "id" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "topicId" TEXT NOT NULL,
 "quotedPricePaise" INTEGER NOT NULL,
 "preferredDate" TIMESTAMP(3) NOT NULL,
 "city" TEXT NOT NULL,
 "devoteeName" TEXT NOT NULL,
 "gotra" TEXT,
 "sankalpNote" TEXT NOT NULL,
 "customerPhone" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'REQUESTED',
 "partnerId" TEXT,
 "scheduledAt" TIMESTAMP(3),
 "evidenceUrl" TEXT,
 "adminNote" TEXT NOT NULL DEFAULT '',
 "version" INTEGER NOT NULL DEFAULT 1,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "PujaBookingRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PujaBookingRequest_userId_createdAt_idx" ON "PujaBookingRequest"("userId","createdAt");
CREATE INDEX IF NOT EXISTS "PujaBookingRequest_status_createdAt_idx" ON "PujaBookingRequest"("status","createdAt");
CREATE INDEX IF NOT EXISTS "PujaBookingRequest_topicId_preferredDate_idx" ON "PujaBookingRequest"("topicId","preferredDate");
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='PujaBookingRequest_userId_fkey') THEN
  ALTER TABLE "PujaBookingRequest" ADD CONSTRAINT "PujaBookingRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
 END IF;
END $$;
