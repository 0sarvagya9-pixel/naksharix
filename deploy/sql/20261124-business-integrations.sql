-- Additive source only. Never apply to production during release hold.
BEGIN;
CREATE TABLE IF NOT EXISTS public."BusinessTenant" (
 "id" TEXT PRIMARY KEY,
 "ownerUserId" TEXT NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "displayName" TEXT NOT NULL,"brandName" TEXT NOT NULL,"contractReference" TEXT NOT NULL,"approvedById" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE','REVOKED')),
 "contractExpiresAt" TIMESTAMP(3) NOT NULL,
 "monthlyUnitLimit" INT NOT NULL CHECK ("monthlyUnitLimit" BETWEEN 1 AND 1000000),
 "unitPricePaise" INT NOT NULL CHECK ("unitPricePaise" BETWEEN 0 AND 100000),
 "scopes" TEXT[] NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "BusinessTenant_ownerUserId_status_idx" ON public."BusinessTenant"("ownerUserId","status");
CREATE TABLE IF NOT EXISTS public."BusinessApiKey" (
 "id" TEXT PRIMARY KEY,"tenantId" TEXT NOT NULL REFERENCES public."BusinessTenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "digest" TEXT NOT NULL UNIQUE,"label" TEXT NOT NULL,"scopes" TEXT[] NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL,"revokedAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "BusinessApiKey_tenantId_revokedAt_idx" ON public."BusinessApiKey"("tenantId","revokedAt");
CREATE TABLE IF NOT EXISTS public."BusinessUsageMonth" (
 "tenantId" TEXT NOT NULL REFERENCES public."BusinessTenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "period" TEXT NOT NULL,"attemptedUnits" INT NOT NULL DEFAULT 0,"completedUnits" INT NOT NULL DEFAULT 0,"failedUnits" INT NOT NULL DEFAULT 0,
 "unitPricePaise" INT NOT NULL CHECK ("unitPricePaise" BETWEEN 0 AND 100000),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
 PRIMARY KEY("tenantId","period"),CHECK("attemptedUnits">=0 AND "completedUnits">=0 AND "failedUnits">=0 AND "completedUnits"+"failedUnits"<="attemptedUnits")
);
CREATE TABLE IF NOT EXISTS public."BusinessUsageCall" (
 "tenantId" TEXT NOT NULL REFERENCES public."BusinessTenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "requestId" TEXT NOT NULL,"period" TEXT NOT NULL,"keyId" TEXT NOT NULL,"scope" TEXT NOT NULL,
 "units" INT NOT NULL CHECK ("units" BETWEEN 1 AND 2),"state" TEXT NOT NULL DEFAULT 'RESERVED' CHECK ("state" IN ('RESERVED','COMPLETED','FAILED')),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"finishedAt" TIMESTAMP(3),PRIMARY KEY("tenantId","requestId")
);
CREATE INDEX IF NOT EXISTS "BusinessUsageCall_tenantId_period_idx" ON public."BusinessUsageCall"("tenantId","period");
COMMIT;
