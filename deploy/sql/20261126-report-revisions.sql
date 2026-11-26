BEGIN;
CREATE TABLE IF NOT EXISTS "ReportRevision" (
  "id" TEXT PRIMARY KEY,
  "reportRequestId" TEXT NOT NULL REFERENCES "ReportRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "version" INTEGER NOT NULL CHECK ("version" >= 2),
  "inputHash" TEXT NOT NULL,
  "input" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING','GENERATING','READY','DECLINED')),
  "reviewNote" TEXT, "reviewedBy" TEXT,
  "bytes" BYTEA, "storageDriver" TEXT, "storageKey" TEXT, "checksum" TEXT, "size" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "ReportRevision_reportRequestId_version_key" ON "ReportRevision"("reportRequestId", "version");
CREATE UNIQUE INDEX IF NOT EXISTS "ReportRevision_reportRequestId_inputHash_key" ON "ReportRevision"("reportRequestId", "inputHash");
ALTER TABLE "ReportRevision"
  ADD COLUMN IF NOT EXISTS "emailStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "firstEmailAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "acceptedEmailAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "providerEmailId" TEXT;
COMMIT;
