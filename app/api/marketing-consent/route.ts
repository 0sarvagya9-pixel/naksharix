import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { marketingConsentVersion, marketingInterests } from "@/lib/marketing-consent";

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("unsubscribe") }).strict(),
  z.object({
    action: z.literal("subscribe"), consent: z.literal(true),
    interest: z.string().refine(value => marketingInterests.some(([id]) => id === value)),
    country: z.string().trim().max(70).optional(),
    locale: z.enum(["en", "hi", "hinglish"])
  }).strict()
]);

// Use the existing CSRF middleware and account session. Never accept an email,
// customer id, inferred demographics, or another person's consent from the request.
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in to manage email updates.", 401);
    const body = await validateJson(request, requestSchema);
    if (body.action === "unsubscribe") {
      await prisma.marketingConsent.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
      return ok({ subscribed: false });
    }
    const account = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, emailVerifiedAt: true, emailVerified: true, role: true } });
    if (!account || account.role !== "USER" || user.isAdminLogin || !(account.emailVerifiedAt || account.emailVerified)) {
      return fail("A verified customer email account is required.", 403);
    }
    const data = {
      emailAtConsent: account.email, interest: body.interest, country: body.country || null,
      locale: body.locale, source: "website-email-updates", consentVersion: marketingConsentVersion,
      confirmedAt: new Date(), revokedAt: null
    };
    const saved = await prisma.marketingConsent.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data, select: { confirmedAt: true } });
    return ok({ subscribed: true, confirmedAt: saved.confirmedAt });
  } catch (error) { return handleApiError(error); }
}
