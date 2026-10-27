-- Additive live catalogue persistence. NO seed overwrite. Review after production backup and isolated restore.
-- Prisma model: ShopCatalogueSnapshot. Idempotent for a structurally matching database.
CREATE TABLE IF NOT EXISTS "ShopCatalogueSnapshot" (
  "id" TEXT NOT NULL,
  "products" JSONB NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "updatedBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShopCatalogueSnapshot_pkey" PRIMARY KEY ("id")
);
-- Do not insert starter products. Existing application fallback remains the authoritative seed until
-- an authenticated Admin publishes edits and the database records the new catalogue snapshot.
