import { Prisma } from "@prisma/client";
import { fail, handleApiError, ok } from "@/lib/api";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// The public catalogue lists only specifically reviewed real partner records.
// Zero partners are seeded. No calendar, availability or ceremony guarantees.
export async function GET() {
  try {
    const partners = await prisma.pujaPartner.findMany({
      where: { reviewStatus: "VERIFIED" },
      select: { id: true, name: true, region: true, traditions: true },
      orderBy: [{ createdAt: "asc" }, { name: "asc" }],
      take: 50
    });
    return ok({ partners }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return fail("Partner registry is not provisioned.", 503);
    }
    return handleApiError(error);
  }
}
