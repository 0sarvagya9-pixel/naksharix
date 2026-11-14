import { Prisma } from "@prisma/client";
import { fail, handleApiError, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Existing paid and pending requests remain available to the rightful customer.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in to view Puja requests.",401);
    const bookings = await prisma.pujaBookingRequest.findMany({
      where:{userId:user.id},orderBy:{createdAt:"desc"},take:60,
      select:{id:true,topicId:true,quotedPricePaise:true,preferredDate:true,city:true,
        devoteeName:true,status:true,scheduledAt:true,partnerId:true,evidenceUrl:true,createdAt:true}
    });
    return ok({bookings});
  } catch(error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return fail("Puja booking storage not provisioned.",503);
    }
    return handleApiError(error);
  }
}

// Fail closed independently of feature flags, cookies, stale forms or old links.
export async function POST() {
  return fail("Puja services coming soon. New bookings are temporarily closed.",503);
}
