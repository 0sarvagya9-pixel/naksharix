import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const kindSchema = z.enum(["WRITTEN_GUIDANCE", "PUJA_ENQUIRY"]);
const schema = z.object({
  kind: kindSchema,
  topic: z.enum(["CAREER", "RELATIONSHIPS", "FAMILY", "SPIRITUAL_PRACTICE", "GENERAL"]),
  message: z.string().trim().min(20).max(1200),
  partnerId: z.string().min(1).max(120).optional()
}).strict();

const categories = {
  CAREER: "Career and decisions",
  RELATIONSHIPS: "Relationships",
  FAMILY: "Family",
  SPIRITUAL_PRACTICE: "Spiritual practice",
  GENERAL: "General enquiry"
} as const;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Please sign in before submitting a private request.", 401);

    // Validate before counting attempts. Never accept recipient IDs, prices,
    // astrologer assignments, payment flags, or an externally supplied subject.
    const input = await validateJson(request, schema);
    if (input.partnerId && input.kind !== "PUJA_ENQUIRY") {
      return fail("Partner references are only valid for puja enquiries", 422);
    }
    const selectedPartner = input.partnerId ? await prisma.pujaPartner.findFirst({
      where: { id: input.partnerId, reviewStatus: "VERIFIED" },
      select: { id: true, name: true }
    }) : null;
    if (input.partnerId && !selectedPartner) {
      return fail("Partner is not reviewed or is unavailable for enquiries", 422);
    }
    const limit = await rateLimit("guidance-enquiry:" + user.id, 5, 86400);
    if (!limit.allowed) return fail("Daily request limit reached. Please try again later.", 429);

    const subject = input.kind === "WRITTEN_GUIDANCE"
      ? "[WRITTEN GUIDANCE] " + categories[input.topic]
      : "[PUJA ENQUIRY] " + categories[input.topic];

    const selectedSubject = selectedPartner
      ? subject + " / Partner enquiry: " + selectedPartner.name.slice(0, 35)
      : subject;
    // Existing customer-owned SupportTicket gives a real admin queue and
    // customer/staff two-way replies without a production schema migration.
    // This is NOT an astrologer assignment, puja booking, or paid service.
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: selectedSubject,
        status: "OPEN",
        priority: "NORMAL",
        messages: [{
          author: "USER",
          text: input.message,
          at: new Date().toISOString()
        }]
      },
      select: { id: true, status: true, subject: true, createdAt: true }
    });

    return ok({
      ticket,
      reviewRequired: true,
      expertAssigned: false,
      bookingCreated: false,
      paymentRequired: false,
      trackingPath: "/support"
    }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}
