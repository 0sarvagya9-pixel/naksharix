import { fail, handleApiError, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

import { countLiveReportOrders } from "@/lib/analytics/report-sales";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Forbidden", 403);
    const [paid, pending, invoices, subscriptions, reports, reportSales, amountsByCurrency] = await Promise.all([
      prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
      prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { amount: true }, _count: true }),
      prisma.invoice.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.purchasedReport.count(),
      countLiveReportOrders(prisma),
      prisma.payment.groupBy({ by: ["status", "currency"], where: { status: { in: ["PAID", "PENDING"] } }, _sum: { amount: true }, orderBy: { currency: "asc" } })
    ]);
    const recent = await prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { email: true, name: true } }, invoice: true } });
    return ok({ paid, pending, invoices, subscriptions, reports, reportSales, amountsByCurrency, recent });
  } catch (error) {
    return handleApiError(error);
  }
}
