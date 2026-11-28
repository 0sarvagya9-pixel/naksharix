import { fail, ok } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { env } from "@/lib/env";
import { getEmailReadiness, sendEmail } from "@/lib/email/email-service";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { EMAIL_TEST_CATEGORIES } from "@/lib/admin/operations-control-copy";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Owner-only 11-mail suite uses provider rate pacing.

/**
 * Explicitly admin-triggered acceptance probe; never accepts a destination or
 * message body from the browser. Provider acceptance is NOT mailbox delivery.
 */
const modeSchema = z.object({ mode: z.enum(["single", "suite"]).default("single") }).strict();
const categories = EMAIL_TEST_CATEGORIES;

export async function POST(request: Request) {
  const admin = await getAdminApiUser();
  if (!admin) return fail("Not found", 404);
  let mode: "single" | "suite" = "single";
  try {
    const raw = await request.text();
    if (raw) {
      const parsed = modeSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) return fail("Invalid acceptance test request.", 400);
      mode = parsed.data.mode;
    }
  } catch { return fail("Invalid acceptance test request.", 400); }
  if (mode === "suite" && !env.EMAIL_QA_RECIPIENT) {
    return fail("The owner-approved acceptance mailbox is not configured.", 503);
  }
  if (!env.ADMIN_EMAIL && !env.EMAIL_QA_RECIPIENT) {
    return fail("The owner mailbox is not configured.", 503);
  }
  const readiness = getEmailReadiness();
  if (!readiness.emailEnabled) return fail("Transactional email adapter is not ready.", 503);
  const recipientSource = mode === "suite" || !env.ADMIN_EMAIL ? "EMAIL_QA_RECIPIENT" : "ADMIN_EMAIL";
  const targetId = recipientSource === "EMAIL_QA_RECIPIENT" ? "configured-owner-qa-mailbox" : "configured-admin-mailbox";
  const recipient = recipientSource === "EMAIL_QA_RECIPIENT" ? "configured owner acceptance mailbox" : "configured admin mailbox";
  const transportMetadata = { recipientSource, provider: "resend", configuredProvider: readiness.provider, deliveryMode: readiness.deliveryMode };

  try {
    // A transaction-scoped Postgres advisory lock serializes the audit count
    // across ALL Vercel instances. Do not rely on in-memory cache when Redis
    // is missing; a failed DB transaction must never send an email.
    const claim = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ locked: string }>>`
        SELECT pg_advisory_xact_lock(
          hashtext(${admin.id}), hashtext(${mode === "suite" ? "naksharix-email-suite-v1" : "naksharix-email-smoke-v1"})
        )::text AS locked
      `;
      const recent = await tx.adminActionLog.count({
        where: {
          adminId: admin.id,
          action: mode === "suite" ? "email.smoke.suite.attempt" : "email.smoke.attempt",
          createdAt: { gte: new Date(Date.now() - (mode === "suite" ? 86400_000 : 3600_000)) }
        }
      });
      if (recent >= (mode === "suite" ? 1 : 2)) return false;
      await tx.adminActionLog.create({
        data: {
          adminId: admin.id,
          action: mode === "suite" ? "email.smoke.suite.attempt" : "email.smoke.attempt",
          targetType: "OperationalEmailTest",
          targetId,
          metadata: { ...transportMetadata, samples: mode === "suite" ? 11 : 1 }
        }
      });
      return true;
    });
    if (!claim) return fail("Email acceptance test rate limit reached.", 429);
    if (mode === "suite") {
      const day = new Date().toISOString().slice(0, 10);
      const outcomes: Array<{ index: number; category: string; providerAccepted: boolean; acceptanceUncertain: boolean; providerMessageId: string | null }> = [];
      for (const [i, category] of categories.entries()) {
        const result = await sendEmail({
          to: env.EMAIL_QA_RECIPIENT!,
          subject: `[NAKSHARIX REAL EMAIL TEST ${i+1}/11] ${category}`,
          text: [
            "NAKSHARIX — PRODUCTION TRANSACTIONAL EMAIL RECEIPT TEST",
            category,
            "Synthetic template only. No real OTP, order, Puja, appointment, report, payment or customer action occurred.",
            "Please confirm receipt in Inbox/Promotions/Spam and inspect SPF, DKIM and DMARC in full message headers.",
            "Provider acceptance is not proof of inbox delivery."
          ].join("\n"),
          idempotencyKey: `naksharix/admin-acceptance/${day}/${i+1}`,
          requireProviderReceipt: true
        });
        const providerAccepted = result.sent && Boolean(result.providerMessageId);
        const outcome = { index: i+1, category, providerAccepted,
          acceptanceUncertain: result.acceptanceUncertain === true || (result.sent && !result.providerMessageId),
          providerMessageId: providerAccepted ? result.providerMessageId! : null };
        // Persist each receipt before the next send. A later timeout or audit
        // failure must not erase the evidence for previously processed messages.
        await prisma.adminActionLog.create({ data: {
          adminId: admin.id, action: "email.smoke.suite.message.outcome", targetType: "OperationalEmailTest", targetId,
          metadata: { ...transportMetadata, ...outcome, inboxVerified: false }
        } });
        outcomes.push(outcome);
        await new Promise(resolve => setTimeout(resolve, 650));
      }
      const accepted = outcomes.filter(x => x.providerAccepted).length;
      await prisma.adminActionLog.create({ data: {
        adminId: admin.id, action: "email.smoke.suite.outcome", targetType: "OperationalEmailTest", targetId,
        metadata: { ...transportMetadata, acceptedCount: accepted, requestedCount: categories.length, outcomes, inboxVerified: false }
      } });
      return ok({
        mode: "suite",
        providerAccepted: accepted === categories.length,
        acceptedCount: accepted,
        requestedCount: categories.length,
        outcomes,
        recipient, recipientSource,
        nextStep: "Ask the owner to confirm which test subjects actually arrived; this records provider acceptance only."
      }, { status: accepted === categories.length ? 200 : 207 });
    }

    const result = await sendEmail({
      to: env.ADMIN_EMAIL ?? env.EMAIL_QA_RECIPIENT!,
      subject: "NAKSHARIX admin email delivery verification",
      text: "NAKSHARIX administrator-requested email test. If this message reached your inbox, record the date and verify the sender's SPF/DKIM/DMARC alignment. Provider acceptance alone does not prove inbox delivery. This message does not confirm a booking, payment or order.",
      requireProviderReceipt: true
    });
    const providerAccepted = result.sent && Boolean(result.providerMessageId);
    await prisma.adminActionLog.create({ data: {
      adminId: admin.id, action: "email.smoke.outcome", targetType: "OperationalEmailTest", targetId,
      metadata: { ...transportMetadata, providerAccepted,
        acceptanceUncertain: result.acceptanceUncertain === true || (result.sent && !result.providerMessageId),
        providerMessageId: providerAccepted ? result.providerMessageId! : null, inboxVerified: false }
    } });
    if (!result.sent) return fail("Email provider did not accept the test message.", 502);
    if (!providerAccepted) return fail("Email provider did not confirm a test message reference.", 502);
    return ok({
      mode: "single", acceptedCount: 1, requestedCount: 1,
      providerAccepted: true,
      recipient, recipientSource, providerMessageId: result.providerMessageId,
      nextStep: "Check the mailbox (including spam) and inspect sender authentication headers. The API cannot verify final delivery."
    });
  } catch {
    return fail("Email provider test did not complete. No delivery was confirmed.", 502);
  }
}
