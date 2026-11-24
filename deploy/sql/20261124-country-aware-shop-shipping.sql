-- Add-only, backwards-compatible with the previous production release.
ALTER TABLE public."ShopOrder"
  ADD COLUMN IF NOT EXISTS "deliveryCountry" TEXT NOT NULL DEFAULT 'IN',
  ADD COLUMN IF NOT EXISTS "shippingQuote" JSONB;
CREATE TABLE IF NOT EXISTS public."ShopShippingRate" (
  "id" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "postalPrefix" TEXT NOT NULL DEFAULT '',
  "shippingPaisePerUnit" INTEGER NOT NULL,
  "taxPaisePerUnit" INTEGER NOT NULL,
  "maxQuantity" INTEGER NOT NULL,
  "carrier" TEXT NOT NULL,
  "evidenceReference" TEXT NOT NULL,
  "dutiesMode" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "reviewedBy" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShopShippingRate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ShopShippingRate_country_productId_postalPrefix_key"
  ON public."ShopShippingRate"("country","productId","postalPrefix");
CREATE INDEX IF NOT EXISTS "ShopShippingRate_country_active_expiresAt_idx"
  ON public."ShopShippingRate"("country","active","expiresAt");
-- Intentionally no seeded international tariffs: only owner-verified carrier
-- rates may open automatic international checkout.
