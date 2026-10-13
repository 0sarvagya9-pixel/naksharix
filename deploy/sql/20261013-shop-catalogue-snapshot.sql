-- NAKSHARIX Shop catalogue migration (NOT automatically applied to production).
-- Apply only after verified Neon backup, schema baseline review, and explicit production approval.
-- Existing Shop default seed remains public before this table exists.
CREATE TABLE IF NOT EXISTS public."ShopCatalogueSnapshot" (
    "id" TEXT NOT NULL,
    "products" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShopCatalogueSnapshot_pkey" PRIMARY KEY ("id")
);
