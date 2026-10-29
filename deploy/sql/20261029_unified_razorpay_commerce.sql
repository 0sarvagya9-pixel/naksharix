-- Required BEFORE activating SHOP_PAYMENTS_ENABLED or deploying refund state writes.
-- Non-destructive additive schema migration; execute only after reviewed production change approval.
-- Preserves the single current Razorpay merchant configuration; no keys are created here.
ALTER TYPE "PaymentPurpose" ADD VALUE IF NOT EXISTS 'SHOP_ORDER';
ALTER TYPE "ReportPaymentStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';
ALTER TABLE "ShopOrder" ADD COLUMN IF NOT EXISTS "fulfillmentEvidenceUrl" TEXT;
