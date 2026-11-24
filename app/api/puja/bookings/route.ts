import { Prisma } from "@prisma/client";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { getPujaRequestState as getPujaLaunchState } from "@/lib/puja/request-readiness";
import { findPujaTopic } from "@/lib/puja/service-catalogue";
import { notifyPujaRequestCreated } from "@/lib/puja/request-notifications";
import { PUJA_STATUS_NOTICES } from "@/lib/puja/customer-notices";
import { getRequestIp, rateLimitResponse } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
const requestSchema = z.object({
  topicId: z.string().regex(/^[a-z0-9-]{2,100}$/),
  expectedPricePaise: z.number().int().min(100).max(100000000),
  city: z.string().trim().min(2).max(100),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  devoteeName: z.string().trim().min(2).max(120),
  gotra: z.string().trim().max(100).nullable(),
  sankalpNote: z.string().trim().min(10).max(1500),
  customerPhone: z.string().trim().regex(/^[+0-9() -]{8,20}$/)
}).strict();

// Existing paid and pending requests remain available to the rightful customer.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in to view Puja requests.", 401);
    const bookings = await prisma.pujaBookingRequest.findMany({
      where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 60,
      select: { id: true, topicId: true, quotedPricePaise: true,
        preferredDate: true, city: true, devoteeName: true, status: true,
        scheduledAt: true, partnerId: true, evidenceUrl: true, createdAt: true }
    });
    return ok({ bookings }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021")
      return fail("Puja booking storage not provisioned.", 503);
    return handleApiError(error);
  }
}

// Disabled by default. A published fee alone never enables a booking.
// Payment is NOT collected here; the admin first verifies an exact Pandit
// and a future ceremony schedule before the user's payment is unlocked.
export async function POST(request: Request) {
  try {
    const release = await getPujaLaunchState();
    if (!release.enabled) {
      return fail("Puja services coming soon. New bookings are temporarily closed.", 503);
    }
    const user = await getCurrentUser();
    if (!user) return fail("Sign in to request a Puja.", 401);
    const limited = rateLimitResponse("puja-intake", user.id || getRequestIp(request), 3, 60_000);
    if (limited) return limited;
    const input = await validateJson(request, requestSchema);
    const topic = findPujaTopic(input.topicId);
    const offer = release.offers[input.topicId];
    if (!topic || !offer) return fail("This Puja is not currently accepting date requests.", 422);
    if (offer.pricePaise !== input.expectedPricePaise)
      return fail("Refresh and review the new price before submitting.", 409);

    // Noon IST preserves the requested civil date in UTC storage. This is
    // NOT a ceremony time or a guaranteed Pandit reservation.
    const day = new Date(input.preferredDate + "T12:00:00+05:30");
    if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0,10) !== input.preferredDate ||
        day.getTime() < Date.now() + 24 * 3600_000 ||
        day.getTime() > Date.now() + 90 * 86400_000)
      return fail("Select a valid preferred date between tomorrow and 90 days ahead.", 422);

    const result = await prisma.$transaction(async tx => {
      await tx.$queryRaw<Array<{ locked: string }>>`
        SELECT pg_advisory_xact_lock(hashtext(${user.id}),hashtext('naksharix-puja-intake-v1'))::text AS locked
      `;
      const recent = await tx.pujaBookingRequest.count({
        where: { userId: user.id, createdAt: { gte: new Date(Date.now()-86400_000) } }
      });
      if (recent >= 3) return { kind: "limit" as const };
      const duplicate = await tx.pujaBookingRequest.findFirst({
        where: { userId: user.id, topicId: input.topicId,
          preferredDate: day, status: { in: ["REQUESTED","CONFIRMED","SCHEDULED","IN_PROGRESS"] } },
        select: { id: true }
      });
      if (duplicate) return { kind: "duplicate" as const };
      const booking = await tx.pujaBookingRequest.create({
        data: { userId: user.id, topicId: topic.id, quotedPricePaise: offer.pricePaise,
          preferredDate: day, city: input.city, devoteeName: input.devoteeName,
          gotra: input.gotra, sankalpNote: input.sankalpNote, customerPhone: input.customerPhone,
          status: "REQUESTED" },
        select: { id: true, topicId: true, status: true, quotedPricePaise: true,
          preferredDate: true, createdAt: true }
      });
      return { kind: "created" as const, booking };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (result.kind === "limit") return fail("Daily Puja request limit reached.", 429);
    if (result.kind === "duplicate")
      return fail("A request for this Puja and date already exists in My Puja Requests.", 409);

    const notification = await notifyPujaRequestCreated({
      id: result.booking.id, userId: user.id, topicName: topic.name
    }).catch(() => ({customer:"unavailable" as const,admin:"unavailable" as const}));
    return ok({ booking: result.booking, charged: false, paymentDueNow: false,
      statusMessage: PUJA_STATUS_NOTICES.REQUESTED,
      notifications: { customerEmailAccepted: notification.customer === "accepted",
        adminEmailAccepted: notification.admin === "accepted" },
      nextStep: "Pandit acceptance and a confirmed ceremony time are required before payment." },
    { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021")
      return fail("Puja booking storage not provisioned.", 503);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034")
      return fail("Another request changed at the same time. Please retry.", 409);
    return handleApiError(error);
  }
}
