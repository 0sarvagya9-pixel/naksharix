import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getEmailReadiness, sendEmail } from "@/lib/email/email-service";

// A temporary owner-approved single-recipient transactional email dispatcher.
// All customer-specific information is fetched from the private database.
// Only a one-way SHA-256 digest of the independent trigger is in public code.
const TRIGGER_SHA256 = "e9bb162edd7f0105e37c3f94753313a9439f0922eabf7514335edb8e7b7a0db5";
const REQUEST_ID = "care-request-20261114-34c1b2d7";
const CLAIM_ID = "care-claimed-20261114-34c1b2d7";
const EXPIRES = Date.parse("2026-11-15T23:59:59Z");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function outcome(status: number, code: string) {
  return NextResponse.json({ outcome: code }, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" }
  });
}

export function HEAD() {
  return new Response(null, {status:405,headers:{"Cache-Control":"no-store"}});
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !/^[A-Za-z0-9_-]{50,80}$/.test(token) || Date.now() > EXPIRES) {
    return outcome(404, "not_found");
  }
  const actual = createHash("sha256").update(token,"utf8").digest();
  const expected = Buffer.from(TRIGGER_SHA256,"hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return outcome(404, "not_found");
  }

  // Neither the connected personal Gmail address nor any alternative sender
  // is acceptable for this explicitly official care@ mail.
  const sender = env.SMTP_FROM?.trim() ?? "";
  if (!getEmailReadiness().emailEnabled ||
      !/^(?:[^<>]*<)?care@naksharix\.com>?$/i.test(sender)) {
    return outcome(503, "care_sender_unavailable");
  }

  try {
    const dispatch = await prisma.adminActionLog.findUnique({
      where: {id:REQUEST_ID},
      select: {adminId:true,action:true,targetType:true,targetId:true,metadata:true}
    });
    if (!dispatch || dispatch.action !== "care.puja.owner_approved" ||
        dispatch.targetType !== "PujaBookingRequest") {
      return outcome(409, "dispatch_not_authorized");
    }
    const admin = await prisma.user.findUnique({
      where:{id:dispatch.adminId},select:{role:true}
    });
    if (!admin || !["ADMIN","SUPER_ADMIN"].includes(admin.role)) {
      return outcome(409, "admin_actor_invalid");
    }
    const meta = dispatch.metadata && !Array.isArray(dispatch.metadata)
      ? dispatch.metadata as Record<string,unknown> : {};
    const partnerId = typeof meta.partnerId === "string" ? meta.partnerId : "";
    if (!partnerId) return outcome(409,"partner_not_set");
    const partner = await prisma.pujaPartner.findUnique({
      where:{id:partnerId},select:{name:true,reviewStatus:true}
    });
    if (!partner || partner.reviewStatus === "REJECTED") {
      return outcome(409,"partner_record_missing");
    }
    const booking = await prisma.pujaBookingRequest.findUnique({
      where:{id:dispatch.targetId},
      select:{
        id:true,userId:true,status:true,topicId:true,
        devoteeName:true,gotra:true,preferredDate:true,
        quotedPricePaise:true
      }
    });
    if (!booking || booking.topicId!=="chandra-graha-shanti-puja" ||
        !["CONFIRMED","SCHEDULED"].includes(booking.status)) {
      return outcome(409,"booking_not_ready");
    }
    const customer = await prisma.user.findUnique({
      where:{id:booking.userId},select:{email:true}
    });
    if (!customer?.email) return outcome(409,"recipient_not_found");
    const payment = await prisma.payment.findFirst({
      where:{
        userId:booking.userId,purpose:"PUJA_BOOKING",
        status:"PAID",provider:"RAZORPAY",
        metadata:{path:["pujaBookingId"],equals:booking.id}
      },
      select:{amount:true,currency:true,providerPaymentId:true}
    });
    const paymentPaise=payment?Math.round(Number(payment.amount)*100):0;
    if (!payment || !payment.providerPaymentId || payment.currency !== "INR" ||
        paymentPaise <= 0 || paymentPaise !== booking.quotedPricePaise) {
      return outcome(409,"payment_not_verified");
    }
    const date = new Intl.DateTimeFormat("hi-IN", {
      dateStyle:"full",timeZone:"Asia/Kolkata"
    }).format(booking.preferredDate);
    const subject = "आपकी ऑनलाइन चंद्र ग्रह शांति पूजा – भुगतान पुष्टि एवं आवश्यक जानकारी | NAKSHARIX";
    const text = [
      "आदरणीय श्री " + booking.devoteeName + " जी,",
      "",
      "सादर नमस्कार।",
      "",
      "NAKSHARIX में आपकी ऑनलाइन चंद्र ग्रह शांति पूजा की बुकिंग प्राप्त हो गई है।",
      "आपका ₹" + payment.amount.toFixed(2) +
        " का भुगतान सफलतापूर्वक प्राप्त और सत्यापित है। इस बुकिंग के लिए कोई अतिरिक्त भुगतान लंबित नहीं है।",
      "",
      "आपकी बुकिंग का विवरण:",
      "- पूजा: चंद्र ग्रह शांति पूजा",
      "- बुकिंग क्रमांक: " + booking.id,
      "- भुगतान राशि: ₹" + payment.amount.toFixed(2) + " — पूर्ण भुगतान प्राप्त",
      "- भुगतान माध्यम: Razorpay",
      "- भुगतान संदर्भ: " + payment.providerPaymentId,
      "- आपकी पसंद की तिथि: " + date,
      "- पूजा का माध्यम: ऑनलाइन",
      "- पूजा के लिए प्रस्तावित पंडित: " + partner.name,
      "",
      "आपका नाम, गोत्र और पूजा का संकल्प हमारे रिकॉर्ड में पहले से सुरक्षित दर्ज हैं। इन्हें दोबारा भेजने की आवश्यकता नहीं है।",
      "",
      "कृपया इसी ईमेल के उत्तर में निम्न जानकारी भेजें:",
      "1. क्या आपकी पसंद की तिथि सुविधाजनक है? भारतीय समयानुसार पूजा के लिए दो सुविधाजनक समय बताएं।",
      "2. क्या आप और परिवारजन ऑनलाइन पूजा में लाइव शामिल होना चाहेंगे?",
      "3. Google Meet, WhatsApp या किसी अन्य वीडियो कॉल माध्यम में आपकी प्राथमिकता क्या है?",
      "4. पंजीकृत मोबाइल नंबर पर WhatsApp उपलब्ध है? नंबर बदलना हो तो नया नंबर बताएं।",
      "5. क्या संकल्प में परिवार के किसी अन्य सदस्य का नाम भी शामिल करवाना चाहते हैं?",
      "6. पूजा के लिए कोई अन्य विशेष निर्देश हों तो बताएं।",
      "",
      "अगले चरण:",
      "आपके उत्तर के बाद हमारी टीम " + partner.name + " के साथ तिथि और समय की अंतिम पुष्टि करेगी।",
      "समय निश्चित होने के बाद आपको ऑनलाइन पूजा लिंक, आवश्यक सामग्री और तैयारी के निर्देश दिए जाएंगे।",
      "पूजा संपन्न होने पर उपलब्ध वास्तविक जानकारी और स्थिति बुकिंग रिकॉर्ड में अपडेट की जाएगी।",
      "",
      "महत्वपूर्ण: अभी पूजा का अंतिम समय निर्धारित नहीं हुआ है। लिखित पुष्टि से पहले तैयारी अंतिम न करें।",
      "किसी OTP, बैंक पासवर्ड या कार्ड की जानकारी न भेजें।",
      "यदि किसी अन्य प्रेषक से पहले संदेश मिला हो तो कृपया इस आधिकारिक care@naksharix.com ईमेल पर ही उत्तर दें।",
      "",
      "सादर,",
      "ग्राहक सेवा टीम",
      "NAKSHARIX",
      "care@naksharix.com",
      "https://www.naksharix.com"
    ].join("\n");

    // Immutable claim guarantees one send attempt across all invocations.
    try {
      await prisma.adminActionLog.create({
        data:{
          id:CLAIM_ID,
          adminId:dispatch.adminId,
          action:"care.puja.one_time_email_claim",
          targetType:"PujaBookingRequest",
          targetId:booking.id,
          metadata:{sender:"care@naksharix.com",oneTime:true}
        }
      });
    } catch(e) {
      if(e instanceof Prisma.PrismaClientKnownRequestError && e.code==="P2002") {
        return outcome(409,"already_attempted_no_duplicate");
      }
      return outcome(503,"claim_failed");
    }

    const sent = await sendEmail({
      to:customer.email,
      subject,
      text,
      idempotencyKey:"naksharix-puja-official-20261114-34c1b2d7"
    });
    await prisma.adminActionLog.create({
      data:{
        adminId:dispatch.adminId,
        action:"care.puja.one_time_email_result",
        targetType:"PujaBookingRequest",
        targetId:booking.id,
        metadata:{providerAccepted:sent.sent,sender:"care@naksharix.com"}
      }
    }).catch(()=>undefined);
    return outcome(sent.sent?200:503,
      sent.sent?"care_provider_accepted":"care_provider_rejected");
  } catch {
    return outcome(503,"dispatch_not_completed");
  }
}
