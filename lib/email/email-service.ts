import "server-only";
import { env } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";
import type { EmailReadiness, EmailSendResult } from "@/lib/email/types";

const RESEND_SMTP_HOST = "smtp.resend.com";
const RESEND_SMTP_USER = "resend";
const RESEND_EMAIL_API = "https://api.resend.com/emails";

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
      missing: ["EMAIL_PROVIDER=smtp", "SMTP_HOST=smtp.resend.com", "SMTP_USER=resend", "SMTP_PASS", "SMTP_FROM"],
      deliveryMode: "disabled",
      reason: "Email delivery is disabled; secure download remains available."
    };
  }

  const missing = [
    env.SMTP_HOST ? null : "SMTP_HOST",
    env.SMTP_HOST === RESEND_SMTP_HOST ? null : "SMTP_HOST=smtp.resend.com",
    env.SMTP_USER ? null : "SMTP_USER",
    env.SMTP_USER === RESEND_SMTP_USER ? null : "SMTP_USER=resend",
    env.SMTP_PASS ? null : "SMTP_PASS",
    env.SMTP_FROM ? null : "SMTP_FROM"
  ].filter(Boolean) as string[];

  return {
    provider: "smtp",
    emailEnabled: missing.length === 0,
    missing,
    deliveryMode: missing.length === 0 ? "resend_api" : "disabled",
    reason: missing.length
      ? "Resend production email configuration is incomplete or unexpected; delivery is disabled."
      : "Resend email delivery is configured using the verified domain/API key while preserving the existing SMTP environment contract."
  };
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<EmailSendResult> {
  const readiness = getEmailReadiness();
  if (!readiness.emailEnabled) {
    logger.warn("email_delivery_disabled", { provider: readiness.provider, missingCount: readiness.missing.length });
    return { sent: false, reason: readiness.reason, missing: readiness.missing };
  }

  if (!input.text && !input.html) {
    logger.warn("email_delivery_empty_body", { provider: "resend" });
    return { sent: false, reason: "Email body is empty.", missing: [] };
  }

  const payload: Record<string, unknown> = {
    from: env.SMTP_FROM!,
    to: [input.to],
    subject: input.subject
  };
  if (input.text) payload.text = input.text;
  if (input.html) payload.html = input.html;

  const response = await fetch(RESEND_EMAIL_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SMTP_PASS!}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    logger.warn("email_delivery_provider_rejected", { provider: "resend", status: response.status });
    return { sent: false, reason: "Email provider rejected the delivery request.", missing: [] };
  }

  logger.info("email_delivery_completed", { provider: "resend", status: response.status });
  return { sent: true, reason: "Email delivery completed.", missing: [] };
}
