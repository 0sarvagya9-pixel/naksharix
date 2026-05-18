import { fail, handleApiError, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) return fail("Unauthorized", 403);
    const profiles = await prisma.astrologerProfile.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 20,
      include: { user: { select: { email: true, name: true } } }
    });
    return ok({ profiles });
  } catch (error) {
    return handleApiError(error);
  }
}
