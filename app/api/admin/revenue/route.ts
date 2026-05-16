import { fail, handleApiError, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return fail("Forbidden", 403);
    const [paid, pending, invoices, subscriptions, reports] = await Promise.all([
      prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
      prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { amount: true }, _count: true }),
      prisma.invoice.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.purchasedReport.count()
    ]);
    const recent = await prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { email: true, name: true } }, invoice: true } });
    return ok({ paid, pending, invoices, subscriptions, reports, recent });
  } catch (error) {
    return handleApiError(error);
  }
}
