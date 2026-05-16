import "server-only";
import nodemailer from "nodemailer";
import { env } from "@/lib/env";

export async function sendEmail(input: { to: string; subject: string; html: string }) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.info("Email skipped; SMTP is not configured", input.subject);
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
  });

  return transporter.sendMail({
    from: `"${env.NEXT_PUBLIC_APP_NAME}" <${env.SMTP_USER}>`,
    ...input
  });
}
