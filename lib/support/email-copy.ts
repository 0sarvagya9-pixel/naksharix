import type { Locale } from "@/lib/i18n";

export function supportReplyEmail(locale: Locale, reference: string, url: string) {
  if (locale === "hi") return {
    subject: "Naksharix सहायता: आपके अनुरोध का नया उत्तर",
    text: ["नमस्ते,", "", "Naksharix सहायता दल ने आपके सहायता अनुरोध का उत्तर दिया है।", `संदर्भ: ${reference}`, `प्रवेश करके उत्तर सुरक्षित रूप से पढ़ें: ${url}`, "", "इस सूचना में निजी संदेश, जन्म विवरण, OTP या पासवर्ड शामिल नहीं हैं।", "ईमेल सेवा द्वारा स्वीकार किया जाना inbox तक पहुँचने का प्रमाण नहीं है।"].join("\n")
  };
  if (locale === "hinglish") return {
    subject: "Naksharix Support: Aapki request ka naya reply",
    text: ["Namaste,", "", "Naksharix support team ne aapki support request ka reply diya hai.", `Reference: ${reference}`, `Sign in karke reply securely padhein: ${url}`, "", "Is notification mein private messages, birth details, OTP ya password shaamil nahi hain.", "Email provider ka accept karna inbox delivery ka proof nahi hai."].join("\n")
  };
  return {
    subject: "Naksharix Support: New response to your ticket",
    text: ["Namaste,", "", "A member of the Naksharix support team has replied to your support ticket.", `Reference: ${reference}`, `Read the response securely after signing in: ${url}`, "", "We do not include private ticket messages, birth details, OTPs or passwords in this notification.", "Provider acceptance of this message does not prove inbox delivery."].join("\n")
  };
}
