import { fail, handleApiError, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role)) return fail("Forbidden", 403);
    const [users, payments, appointments, posts, shopOrders, shopDelivered, pujaRequests, pujasCompleted, reportsGenerated, reportsDelivered, supportOpen, verifiedPujaPartners] = await Promise.all([
      prisma.user.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, _count: true }),
      prisma.appointment.count(),
      prisma.blogPost.count(),
      prisma.shopOrder.count(),
      prisma.shopOrder.count({ where: { status: "DELIVERED" } }),
      prisma.pujaBookingRequest.count(),
      prisma.pujaBookingRequest.count({ where: { status: "COMPLETED" } }),
      prisma.reportRequest.count({ where: { generatedPdfSize: { gt: 0 } } }),
      prisma.reportRequest.count({ where: { status: "DELIVERED" } }),
      prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.pujaPartner.count({ where: { reviewStatus: "VERIFIED" } })
    ]);
    return ok({
      users,
      revenue: Number(payments._sum.amount ?? 0),
      paymentCount: payments._count,
      appointments,
      posts,
      operational: {
        shopOrders, shopDelivered, pujaRequests, pujasCompleted,
        reportsGenerated, reportsDelivered, supportOpen, verifiedPujaPartners,
        source: "production_database_statuses",
        externallyVerifiedFulfilment: false,
        visitorAnalytics: "not_configured"
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
