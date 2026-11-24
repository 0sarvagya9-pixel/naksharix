import "server-only";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getEmailReadiness } from "@/lib/email/email-service";
import { getPujaLaunchState } from "@/lib/puja/launch-readiness";
import { pujaTopics } from "@/lib/puja/service-catalogue";
import { PUJA_PLATFORM_FEE_PAISE } from "@/lib/puja/fee-terms";
import type { PublicPujaOffer } from "@/lib/puja/offerings";

export type PujaRequestState = Awaited<ReturnType<typeof getPujaLaunchState>> & { requestOnly: boolean };

/** Owner-controlled, unpaid coordination requests. Never use for payment authorization. */
export async function getPujaRequestState(): Promise<PujaRequestState> {
  const paidLaunch = await getPujaLaunchState();
  if (paidLaunch.enabled) return { ...paidLaunch, requestOnly: false };
  const closed = { ...paidLaunch, requestOnly: false };
  if (env.PUJA_REQUEST_INTAKE_ENABLED !== "true" || !env.ADMIN_EMAIL || !getEmailReadiness().emailEnabled) return closed;
  try {
    await prisma.pujaBookingRequest.findFirst({ select: { id: true } });
    const offers: Record<string, PublicPujaOffer> = Object.fromEntries(pujaTopics.map(topic => [
      topic.id, { topicId: topic.id, pricePaise: PUJA_PLATFORM_FEE_PAISE, durationMinutes: null, note: "" }
    ]));
    return { ...paidLaunch, enabled: true, requestOnly: true, offers };
  } catch { return closed; }
}
