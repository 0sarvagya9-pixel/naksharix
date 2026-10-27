-- Additive owner-controlled specialist report fees. No mutation to Razorpay payment price contracts.
CREATE TABLE IF NOT EXISTS "ManualReportOffering" (
 "reportSlug" TEXT NOT NULL,
 "pricePaise" INTEGER,
 "available" BOOLEAN NOT NULL DEFAULT FALSE,
 "deliveryDays" INTEGER,
 "note" TEXT NOT NULL DEFAULT '',
 "updatedBy" TEXT NOT NULL,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "ManualReportOffering_pkey" PRIMARY KEY ("reportSlug")
);
