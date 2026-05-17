import { handleApiError, ok } from "@/lib/api";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdminRole();
    const reportRequests = await prisma.reportRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { email: true, name: true } },
        payment: { select: { id: true, amount: true, currency: true, providerOrderId: true, providerPaymentId: true, status: true } }
      }
    });
    return ok({ reportRequests });
  } catch (error) {
    return handleApiError(error);
  }
}

