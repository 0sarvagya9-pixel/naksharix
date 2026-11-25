-- Additive, default-off internal review operations. No existing row mutation.
CREATE TABLE IF NOT EXISTS public."DeferredServicePlan" (
 "id" TEXT PRIMARY KEY, "kind" TEXT NOT NULL, "target" TEXT NOT NULL, "label" TEXT NOT NULL,
 "providerRef" TEXT NOT NULL, "evidenceRef" TEXT NOT NULL, "termsRef" TEXT NOT NULL,
 "capacity" INTEGER NOT NULL CHECK ("capacity" BETWEEN 1 AND 10000),
 "startsAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3) NOT NULL,
 "state" TEXT NOT NULL DEFAULT 'DRAFT' CHECK ("state" IN ('DRAFT','REVIEWED','CLOSED')),
 "reviewedById" TEXT, "reviewedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CHECK ("endsAt" > "startsAt")
);
CREATE INDEX IF NOT EXISTS "DeferredServicePlan_kind_state_endsAt_idx" ON public."DeferredServicePlan" ("kind","state","endsAt");
CREATE TABLE IF NOT EXISTS public."DeferredServiceAllocation" (
 "id" TEXT PRIMARY KEY, "planId" TEXT NOT NULL, "ticketId" TEXT NOT NULL UNIQUE, "userId" TEXT NOT NULL,
 "units" INTEGER NOT NULL CHECK ("units">0), "completedUnits" INTEGER NOT NULL DEFAULT 0,
 "state" TEXT NOT NULL DEFAULT 'HELD' CHECK ("state" IN ('HELD','ACCEPTED','PARTIAL','COMPLETED','CANCELED')),
 "version" INTEGER NOT NULL DEFAULT 1, "holdUntil" TIMESTAMP(3) NOT NULL,
 "acceptedAt" TIMESTAMP(3), "canceledAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CHECK ("completedUnits">=0 AND "completedUnits"<="units" AND "version">0),
 FOREIGN KEY ("planId") REFERENCES public."DeferredServicePlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 FOREIGN KEY ("ticketId") REFERENCES public."SupportTicket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
 FOREIGN KEY ("userId") REFERENCES public."User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "DeferredServiceAllocation_planId_state_holdUntil_idx" ON public."DeferredServiceAllocation" ("planId","state","holdUntil");
CREATE INDEX IF NOT EXISTS "DeferredServiceAllocation_userId_createdAt_idx" ON public."DeferredServiceAllocation" ("userId","createdAt");
CREATE TABLE IF NOT EXISTS public."DeferredServiceReceipt" (
 "id" TEXT PRIMARY KEY, "allocationId" TEXT NOT NULL, "operationId" TEXT NOT NULL UNIQUE,
 "evidenceRef" TEXT NOT NULL, "units" INTEGER NOT NULL CHECK ("units">0),
 "occurredAt" TIMESTAMP(3) NOT NULL, "actorId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE ("allocationId","evidenceRef"),
 FOREIGN KEY ("allocationId") REFERENCES public."DeferredServiceAllocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "DeferredServiceReceipt_allocationId_occurredAt_idx" ON public."DeferredServiceReceipt" ("allocationId","occurredAt");
