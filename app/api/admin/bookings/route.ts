import { handleApiError, ok } from "@/lib/api";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdminRole();
    const bookings = await prisma.consultationBooking.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { name: true, email: true } },
        astrologerProfile: { include: { user: { select: { name: true, email: true } } } }
      }
    });
    return ok({ bookings });
  } catch (error) {
    return handleApiError(error);
  }
}
