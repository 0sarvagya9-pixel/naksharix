import "server-only";

import { sendEmail } from "@/lib/email/email-service";

export async function sendConsultationBookingEmail(input: {
  to: string;
  customerName: string;
  astrologerName: string;
  bookingId: string;
  scheduledAt: Date;
  paymentRequired: boolean;
}) {
  const when = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata"
  }).format(input.scheduledAt);

  return sendEmail({
    to: input.to,
    subject: input.paymentRequired ? "Naksharix consultation request received" : "Naksharix consultation confirmed",
    text: [
      `Namaste ${input.customerName},`,
      "",
      input.paymentRequired
        ? "Your consultation request has been created. Complete the listed payment flow on Naksharix to confirm the booking."
        : "Your consultation booking is confirmed.",
      `Astrologer: ${input.astrologerName}`,
      `Scheduled: ${when}`,
      `Booking reference: ${input.bookingId}`,
      "",
      "For privacy and safety, this email does not include your birth details or private question.",
      "Use your Naksharix account dashboard for the latest booking status."
    ].join("\n")
  });
}
