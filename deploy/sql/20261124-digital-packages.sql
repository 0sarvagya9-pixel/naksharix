-- Additive only, do not execute against production before explicit approval.
ALTER TYPE public."PaymentPurpose" ADD VALUE IF NOT EXISTS 'DIGITAL_PACKAGE';
BEGIN;
CREATE TABLE IF NOT EXISTS public."DigitalPackageOrder" (
 "id" TEXT PRIMARY KEY,
 "userId" TEXT NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "clientIntent" TEXT NOT NULL,
 "productKey" TEXT NOT NULL,
 "productVersion" TEXT NOT NULL,
 "pricePaise" INTEGER NOT NULL CHECK ("pricePaise" BETWEEN 100 AND 10000000),
 "consentVersion" TEXT NOT NULL,
 "inputDigest" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'DRAFT' CHECK ("status" IN ('DRAFT','PAYMENT_PENDING','PAID','REVIEW','REFUNDED','CANCELED')),
 "expiresAt" TIMESTAMP(3) NOT NULL,
 "paymentId" TEXT UNIQUE REFERENCES public."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "DigitalPackageOrder_userId_clientIntent_key" ON public."DigitalPackageOrder"("userId","clientIntent");
CREATE INDEX IF NOT EXISTS "DigitalPackageOrder_userId_createdAt_idx" ON public."DigitalPackageOrder"("userId","createdAt");
CREATE INDEX IF NOT EXISTS "DigitalPackageOrder_userId_status_idx" ON public."DigitalPackageOrder"("userId","status");
CREATE TABLE IF NOT EXISTS public."DigitalPackageItem" (
 "id" TEXT PRIMARY KEY,
 "orderId" TEXT NOT NULL REFERENCES public."DigitalPackageOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "position" INTEGER NOT NULL CHECK ("position" BETWEEN 0 AND 9),
 "kind" TEXT NOT NULL,
 "privateInput" JSONB,
 "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING','GENERATING','READY','RETRY')),
 "leaseToken" TEXT,
 "leaseUntil" TIMESTAMP(3),
 "attempts" INTEGER NOT NULL DEFAULT 0 CHECK ("attempts" >= 0),
 "pdfBytes" BYTEA,
 "pdfStorageKey" TEXT,
 "pdfStorageDriver" TEXT,
 "pdfChecksum" TEXT,
 "pdfSize" INTEGER CHECK ("pdfSize" IS NULL OR "pdfSize">0),
 "generatedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "DigitalPackageItem_orderId_position_key" ON public."DigitalPackageItem"("orderId","position");
CREATE INDEX IF NOT EXISTS "DigitalPackageItem_orderId_status_idx" ON public."DigitalPackageItem"("orderId","status");
COMMIT;
