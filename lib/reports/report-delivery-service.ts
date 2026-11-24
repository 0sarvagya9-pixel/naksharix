import { getEmailReadiness, sendEmail } from "@/lib/email/email-service";

function htmlEscape(s:string){return s.replace(/[&<>"\x27]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\x27":"&#39;"}[ch]??ch));}

export function getReportDeliveryReadiness() {
  return getEmailReadiness();
}

export async function sendReportDeliveryEmail(input: {
  to: string;
  fullName: string;
  reportRequestId: string;
  downloadUrl: string;
  reportName?: string;
  language?: "en"|"hi"|"hinglish";
}) {
  const readiness = getReportDeliveryReadiness();
  if (!readiness.emailEnabled) {
    return { sent: false, reason: readiness.reason, missing: readiness.missing };
  }

  const hi=input.language==="hi",hinglish=input.language==="hinglish";
  const title=input.reportName??"Personalized Astrology Report";
  const greeting=hi?`नमस्ते ${input.fullName},`:`Namaste ${input.fullName},`;
  const ready=hi?"आपकी व्यक्तिगत रिपोर्ट तैयार है। सुरक्षित PDF डाउनलोड करने के लिए अपने नक्षरिक्ष खाते में साइन इन करें।":hinglish?"Aapki personalized report ready hai. Secure PDF download ke liye apne Naksharix account mein sign in karein.":"Your personalized report is ready for secure download. Sign in to your Naksharix account to access your private PDF.";
  const button=hi?"अपनी PDF रिपोर्ट डाउनलोड करें":hinglish?"Apni PDF report download karein":"Download your PDF report";
  const subject=hi?"आपकी नक्षरिक्ष रिपोर्ट तैयार है":hinglish?"Aapki Naksharix report ready hai":"Your Naksharix report is ready";
  const disclaimer=hi?"ज्योतिष और अंक ज्योतिष आत्मचिंतन के साधन हैं; निश्चित परिणाम या पेशेवर सलाह नहीं।":"Astrology and numerology are reflective guidance, not guaranteed outcomes or professional advice.";
  const html=`<div style="margin:0;padding:24px 10px;background:#f8f2e9;font-family:Arial,sans-serif;color:#342b36"><table role="presentation" style="width:100%;max-width:620px;margin:auto;border-collapse:collapse;background:white;border:1px solid #e0c49a;border-radius:14px"><tr><td style="padding:28px;background:#261e34;color:#fff"><img src="https://www.naksharix.com/images/naksharix-final-logo-symbol.png" width="58" height="58" alt="Naksharix" style="display:block;margin-bottom:10px"/><div style="font-family:Georgia,serif;letter-spacing:3px;font-size:23px;font-weight:bold;color:#f7d28d">NAKSHARIX</div><p style="margin:8px 0 0;font-size:13px">Personalized reports · Private &amp; secure</p></td></tr><tr><td style="padding:28px"><h1 style="font-size:22px;color:#762e42;margin:0 0 15px">${htmlEscape(title)}</h1><p>${htmlEscape(greeting)}</p><p style="line-height:1.7">${htmlEscape(ready)}</p><p style="margin:26px 0"><a href="${htmlEscape(input.downloadUrl)}" style="background:#762e42;color:#fff;border-radius:8px;padding:14px 20px;display:inline-block;font-weight:bold;text-decoration:none">${htmlEscape(button)}</a></p><p style="font-size:13px;line-height:1.6">Request reference: ${htmlEscape(input.reportRequestId)}<br>For privacy, this report requires your account sign-in. You can also access it through My Readings or your profile.</p><p style="font-size:12px;line-height:1.6;color:#665c68">${htmlEscape(disclaimer)}</p></td></tr><tr><td style="background:#fbf4e7;padding:18px 28px;color:#5c4550;font-size:12px;line-height:1.6">NAKSHARIX · <a href="https://www.naksharix.com">www.naksharix.com</a><br>Support: <a href="mailto:care@naksharix.com">care@naksharix.com</a></td></tr></table></div>`;
  return sendEmail({
    to: input.to,
    idempotencyKey: "naksharix/report-delivery/" + input.reportRequestId,
    subject,
    html,
    text: [
      "NAKSHARIX",
      title,
      greeting,
      "",
      ready,
      "Your private PDF is ready for secure download.",
      `Download: ${input.downloadUrl}`,
      `Request reference: ${input.reportRequestId}`,
      "Support: care@naksharix.com | www.naksharix.com",
      "",
      "Guidance on Naksharix is intended for reflection and spiritual insight. It should not replace professional medical, legal, financial, or mental health advice."
    ].join("\n")
  });
}
