import { fail, handleApiError, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role)) return fail("Forbidden", 403);
    const [users, payments, appointments, posts] = await Promise.all([
      prisma.user.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, _count: true }),
      prisma.appointment.count(),
      prisma.blogPost.count()
    ]);
    return ok({
      users,
      revenue: Number(payments._sum.amount ?? 0),
      paymentCount: payments._count,
      appointments,
      posts
    });
  } catch (error) {
    return handleApiError(error);
  }
}
