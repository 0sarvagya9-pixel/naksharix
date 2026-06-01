import "server-only";
import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";
import type { EmailReadiness, EmailSendResult } from "@/lib/email/types";

export function getEmailReadiness(): EmailReadiness {
  if (env.EMAIL_PROVIDER === "ses") {
    const missing = [
      env.AWS_SES_REGION ? null : "AWS_SES_REGION",
      env.AWS_SES_FROM ? null : "AWS_SES_FROM"
    ].filter(Boolean) as string[];
    return {
      provider: "ses",
      emailEnabled: false,
      missing,
      deliveryMode: "ses_ready_shell",
      reason: missing.length ? "SES env is incomplete; email delivery is disabled." : "SES env exists, but SES sending adapter is not active until the provider SDK is wired."
    };
  }

  if (env.EMAIL_PROVIDER !== "smtp") {
    return {
      provider: "disabled",
      emailEnabled: false,
      missing: ["EMAIL_PROVIDER=smtp", "SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"],
      deliveryMode: "disabled",
      reason: "Email delivery is disabled; secure download remains available."
    };
  }

  const missing = [
    env.SMTP_HOST ? null : "SMTP_HOST",
    env.SMTP_USER ? null : "SMTP_USER",
    env.SMTP_PASS ? null : "SMTP_PASS",
    env.SMTP_FROM ? null : "SMTP_FROM"
  ].filter(Boolean) as string[];
  return {
    provider: "smtp",
    emailEnabled: missing.length === 0,
    missing,
    deliveryMode: missing.length === 0 ? "smtp_email" : "disabled",
    reason: missing.length ? "SMTP is not fully configured; email delivery remains disabled." : "SMTP is configured for report delivery email."
  };
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<EmailSendResult> {
  const readiness = getEmailReadiness();
  if (!readiness.emailEnabled) {
    logger.warn("email_delivery_disabled", { provider: readiness.provider, missingCount: readiness.missing.length });
    return { sent: false, reason: readiness.reason, missing: readiness.missing };
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST!,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER!,
      pass: env.SMTP_PASS!
    }
  });

  await transporter.sendMail({
    from: env.SMTP_FROM!,
    to: input.to,
    subject: input.subject,
    text: input.text
  });

  return { sent: true, reason: "Email delivery completed.", missing: [] };
}
