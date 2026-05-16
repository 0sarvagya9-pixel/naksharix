import { fail, handleApiError, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { invoice: true, purchasedReport: true, subscription: true }
    });
    return ok({ payments });
  } catch (error) {
    return handleApiError(error);
  }
}
