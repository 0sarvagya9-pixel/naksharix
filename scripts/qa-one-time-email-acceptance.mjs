import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync("app/api/ops/one-time-email-acceptance/route.ts","utf8");
assert.ok(src.includes('createHash, timingSafeEqual') &&
 src.includes('process.env.VERCEL_ENV !== "production"') &&
 src.includes('process.env.VERCEL_GIT_COMMIT_REF !== "complete-production-polish"') &&
 src.includes('Date.now() >= EXPIRES_AT') &&
 src.includes('request.headers.get("x-naksharix-email-test-key")') &&
 src.includes('safeEqualsHash(token, TOKEN_SHA256)') &&
 src.includes('safeEqualsHash(recipient, RECIPIENT_SHA256)'),
 "One-time email test must be production-only, expiring and bound to high-entropy token and one pre-approved recipient");
assert.ok(src.includes('const BATCH_KEY = "naksharix-email-acceptance-20261104-v1"') &&
 src.includes('idempotencyKey: `${BATCH_KEY}/${number}`') &&
 src.includes('await new Promise(resolve => setTimeout(resolve, 650))'),
 "Provider idempotency and bounded send rate are required");
assert.ok(src.includes('getEmailReadiness()') && src.includes('readiness.deliveryMode !== "resend_api"') &&
 src.includes('await sendEmail({') && src.includes('providerAccepted: accepted') &&
 src.includes('Provider acceptance is not proof of final recipient mailbox delivery.'),
 "Only production Resend is allowed and inbox delivery cannot be fabricated");
for(const part of ["Account verification","Consultation request","Support ticket received","Support staff reply",
  "Written guidance enquiry","Puja service enquiry","Puja booking status","Shop order status",
  "Personalized report ready","Report delivery fallback","Administrator diagnostic"]) {
 assert.ok(src.includes(part),"Missing requested test category: "+part);
}
assert.ok(src.includes("No account-verification code, purchase, payment, refund, report, booking or service was performed."),
 "All messages must state explicitly that no actual transaction or booking happened");
assert.ok(!src.includes("prisma.")&&!src.includes("razorpay")&&!src.includes("payment.create") &&
 !src.includes("booking.create"),"One-time diagnostic cannot mutate production commerce");
console.log("ONE_TIME_RESEND_EMAIL_ACCEPTANCE_QA=PASS;CATEGORIES=11;NO_PAYMENT_WRITES=YES;EXPIRES=20261105");
