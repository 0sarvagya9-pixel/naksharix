import { fail, handleApiError, ok } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Forbidden", 403);
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
