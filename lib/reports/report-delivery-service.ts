import { getEmailReadiness, sendEmail } from "@/lib/email/email-service";

export function getReportDeliveryReadiness() {
  return getEmailReadiness();
}

export async function sendReportDeliveryEmail(input: {
  to: string;
  fullName: string;
  reportRequestId: string;
  downloadUrl: string;
}) {
  const readiness = getReportDeliveryReadiness();
  if (!readiness.emailEnabled) {
    return { sent: false, reason: readiness.reason, missing: readiness.missing };
  }

  return sendEmail({
    to: input.to,
    subject: "Your Naksharix report is ready",
    text: [
      `Namaste ${input.fullName},`,
      "",
      "Your Naksharix report has been generated and is ready for secure download.",
      `Download: ${input.downloadUrl}`,
      "",
      "Guidance on Naksharix is intended for reflection and spiritual insight. It should not replace professional medical, legal, financial, or mental health advice."
    ].join("\n")
  });
}
