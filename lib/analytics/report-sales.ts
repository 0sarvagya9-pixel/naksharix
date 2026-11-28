import { Prisma } from "@prisma/client";
import { paidReports } from "@/lib/paid-reports";
import { getReportSlugForPaidId } from "@/lib/reports/checkout-catalogue";

type ReportSalesCount = { captured: number; review: number };

export async function countLiveReportOrders(db: Prisma.TransactionClient): Promise<ReportSalesCount> {
  const catalogue = paidReports.filter(report => getReportSlugForPaidId(report.id));
  const products = Prisma.join(catalogue.map(report => Prisma.sql`(${report.id}::text, ${report.purpose}::text)`));
  const [counts] = await db.$queryRaw<ReportSalesCount[]>(Prisma.sql`
    WITH catalogue(sku, purpose) AS (VALUES ${products}),
    orders AS (
      SELECT CASE
        WHEN p.metadata->'analyticsLiveOrder' = 'false'::jsonb
          OR u.role IN ('ADMIN', 'SUPER_ADMIN')
          OR r."adminBypass" IS TRUE OR r."paymentStatus" IN ('ADMIN_BYPASS', 'REFUNDED')
          OR EXISTS (
            SELECT 1 FROM "AuditLog" a
            WHERE a.action = 'payment.razorpay_refund_processed_receipt'
              AND a."targetType" = 'RazorpayPayment' AND a."targetId" = p."providerPaymentId"
          ) THEN 'excluded'
        WHEN p.provider = 'RAZORPAY' AND p.currency = 'INR' AND p.amount > 0
          AND p."providerOrderId" IS NOT NULL AND p."providerPaymentId" IS NOT NULL
          AND p.metadata->'analyticsLiveOrder' = 'true'::jsonb
          AND p.metadata->>'gatewayStatus' = 'captured' AND c.sku IS NOT NULL
          AND e."userId" = p."userId" AND e."reportType" = p.purpose
          AND (r.id IS NULL OR r."userId" = p."userId")
          THEN 'captured'
        ELSE 'review'
      END AS evidence
      FROM "Payment" p
      JOIN "User" u ON u.id = p."userId"
      LEFT JOIN catalogue c ON c.sku = p.metadata->>'reportId' AND c.purpose = p.purpose::text
      LEFT JOIN "PurchasedReport" e ON e."paymentId" = p.id
      LEFT JOIN "ReportRequest" r ON r."paymentId" = p.id
      WHERE p.status = 'PAID' AND p.purpose IN ('KUNDLI_REPORT', 'YEARLY_REPORT', 'MATCH_REPORT')
    )
    SELECT count(*) FILTER (WHERE evidence = 'captured')::int AS captured,
           count(*) FILTER (WHERE evidence = 'review')::int AS review FROM orders
  `);
  return counts;
}
