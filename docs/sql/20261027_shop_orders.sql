-- Additive owner-order storage. Run after independent production backup/restore validation.
CREATE TABLE IF NOT EXISTS "ShopOrder" (
 "id" TEXT NOT NULL,
 "userId" TEXT NOT NULL,
 "items" JSONB NOT NULL,
 "customerName" TEXT NOT NULL,
 "customerPhone" TEXT NOT NULL,
 "deliveryAddress" TEXT NOT NULL,
 "deliveryCity" TEXT NOT NULL,
 "deliveryState" TEXT NOT NULL,
 "postalCode" TEXT NOT NULL,
 "customerNote" TEXT NOT NULL DEFAULT '',
 "subtotalPaise" INTEGER NOT NULL,
 "shippingPaise" INTEGER,
 "taxPaise" INTEGER,
 "totalPaise" INTEGER,
 "status" TEXT NOT NULL DEFAULT 'REQUESTED',
 "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
 "fulfillmentMode" TEXT NOT NULL DEFAULT 'MANUAL_CONFIRMATION',
 "trackingReference" TEXT,
 "adminNote" TEXT NOT NULL DEFAULT '',
 "version" INTEGER NOT NULL DEFAULT 1,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "ShopOrder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ShopOrder_userId_createdAt_idx" ON "ShopOrder"("userId","createdAt");
CREATE INDEX IF NOT EXISTS "ShopOrder_status_createdAt_idx" ON "ShopOrder"("status","createdAt");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ShopOrder_userId_fkey') THEN
    ALTER TABLE "ShopOrder" ADD CONSTRAINT "ShopOrder_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
