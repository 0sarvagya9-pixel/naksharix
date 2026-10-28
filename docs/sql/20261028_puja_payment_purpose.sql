-- Additive one-time enum extension. Apply only after staging verification and
-- independent production recovery checkpoint. No payment is charged by this DDL.
ALTER TYPE "PaymentPurpose" ADD VALUE IF NOT EXISTS 'PUJA_BOOKING';
