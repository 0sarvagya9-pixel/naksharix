import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getEmailReadiness, sendEmail } from "@/lib/email/email-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// One-time owner-authorized diagnostic, expires automatically on 5 Nov 2026 UTC.
// Only a high-entropy bearer token and the one approved recipient hash work.
// This route must be removed immediately after the live acceptance request.
const TOKEN_SHA256 = "16582ca309d02a7a7d72cac5971fdf19ddb1ac7311776555e6976f54b6e1fad9";
const RECIPIENT_SHA256 = "7c883b9fec1105d86214e64c9d12732b7206ccabcff7d0de4607f6187e8acea1";
const EXPIRES_AT = Date.UTC(2026, 10, 5, 0, 0, 0);
const BATCH_KEY = "naksharix-email-acceptance-20261104-v1";

function safeEqualsHash(value: string, expectedHash: string) {
  const valueHash = createHash("sha256").update(value).digest();
  return timingSafeEqual(valueHash, Buffer.from(expectedHash, "hex"));
}

const cases = [
  ["01", "Account verification / OTP template", "Registration verification email template. No OTP is generated, usable or stored."],
  ["02", "Consultation request", "Appointment request confirmation template. No consultation booking or payment is created."],
  ["03", "Support ticket received", "Support-intake acknowledgement template. No ticket is created."],
  ["04", "Support staff reply", "Staff-reply notification template. No ticket is updated or closed."],
  ["05", "Written guidance enquiry", "Private written-guidance intake notification template. No expert is assigned."],
  ["06", "Puja service enquiry", "Puja service enquiry notification template. No Puja or Pandit is booked."],
  ["07", "Puja booking status", "Booking status update template. No ceremony is scheduled or marked completed."],
  ["08", "Shop order status", "Shop order status update template. No order, dispatch or delivery is recorded."],
  ["09", "Personalized report ready", "Paid report delivery email template. No PDF or paid entitlement is created."],
  ["10", "Report delivery fallback", "Secure-download fallback notification template. No report or customer download is created."],
  ["11", "Administrator diagnostic", "Administrator configuration and sender-domain test. No customer transaction is performed."]
] as const;

export async function POST(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  if (process.env.VERCEL_ENV !== "production" ||
      process.env.VERCEL_GIT_COMMIT_REF !== "complete-production-polish" ||
      Date.now() >= EXPIRES_AT) {
    return NextResponse.json({ error: "Diagnostic unavailable" }, { status: 404, headers });
  }

  const token = request.headers.get("x-naksharix-email-test-key") ?? "";
  if (!token || !safeEqualsHash(token, TOKEN_SHA256)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403, headers });
  }
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400, headers }); }
  if (!body || Array.isArray(body) || typeof body !== "object" ||
      Object.keys(body).length !== 1 || !("recipient" in body) ||
      typeof body.recipient !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers });
  }
  const recipient = body.recipient.trim().toLowerCase();
  if (!safeEqualsHash(recipient, RECIPIENT_SHA256)) {
    return NextResponse.json({ error: "Recipient is not approved" }, { status: 403, headers });
  }
  const readiness = getEmailReadiness();
  if (!readiness.emailEnabled || readiness.deliveryMode !== "resend_api") {
    return NextResponse.json({ error: "Production Resend adapter is unavailable" }, { status: 503, headers });
  }

  const outcomes: Array<{ number: string; category: string; providerAccepted: boolean }> = [];
  for (const [number, category, detail] of cases) {
    const result = await sendEmail({
      to: recipient,
      subject: `[NAKSHARIX TEST ${number}/11] ${category}`,
      text: [
        "NAKSHARIX — EMAIL DELIVERY TEST ONLY",
        "",
        `Test ${number} of 11: ${category}`,
        detail,
        "",
        "This is a synthetic notification from the production Naksharix email adapter.",
        "No account-verification code, purchase, payment, refund, report, booking or service was performed.",
        "The receiver can confirm inbox/spam receipt and sender authentication.",
        "Please do not reply with an OTP, password, financial or birth details."
      ].join("\n"),
      idempotencyKey: `${BATCH_KEY}/${number}`
    });
    outcomes.push({ number, category, providerAccepted: result.sent });
    // Resend has request-rate limits; stagger calls to minimize 429 responses.
    await new Promise(resolve => setTimeout(resolve, 650));
  }
  const accepted = outcomes.filter(x => x.providerAccepted).length;
  return NextResponse.json({
    data: { requested: cases.length, providerAccepted: accepted, categories: outcomes,
      notice: "Provider acceptance is not proof of final recipient mailbox delivery." }
  }, { status: accepted === cases.length ? 200 : 207, headers });
}
