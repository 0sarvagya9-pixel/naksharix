import { fail, ok } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { env } from "@/lib/env";
import { getEmailReadiness, sendEmail } from "@/lib/email/email-service";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Explicitly admin-triggered acceptance probe; never accepts a destination or
 * message body from the browser. Provider acceptance is NOT mailbox delivery.
 */
export async function POST() {
  const admin = await getAdminApiUser();
  if (!admin) return fail("Not found", 404);
  if (!env.ADMIN_EMAIL) return fail("The owner mailbox is not configured.", 503);
  const readiness = getEmailReadiness();
  if (!readiness.emailEnabled) return fail("Transactional email adapter is not ready.", 503);

  try {
    const limit = await rateLimit("admin-email-smoke:" + admin.id, 2, 3600);
    if (!limit.allowed) return fail("Email acceptance test rate limit reached.", 429);
    const result = await sendEmail({
      to: env.ADMIN_EMAIL,
      subject: "NAKSHARIX admin email delivery verification",
      text: "NAKSHARIX administrator-requested email test. If this message reached your inbox, record the date and verify the sender's SPF/DKIM/DMARC alignment. Provider acceptance alone does not prove inbox delivery. This message does not confirm a booking, payment or order."
    });
    if (!result.sent) return fail("Email provider did not accept the test message.", 502);
    return ok({
      providerAccepted: true,
      recipient: "configured admin mailbox",
      nextStep: "Check the mailbox (including spam) and inspect sender authentication headers. The API cannot verify final delivery."
    });
  } catch {
    return fail("Email provider test did not complete. No delivery was confirmed.", 502);
  }
}
