import "server-only";
import { sendEmail as sendTransactionalEmail } from "@/lib/email/email-service";

export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const result = await sendTransactionalEmail({
    to: input.to,
    subject: input.subject,
    html: input.html
  });

  return {
    sent: result.sent,
    skipped: !result.sent,
    reason: result.reason
  };
}
