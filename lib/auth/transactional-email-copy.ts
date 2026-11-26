import { normalizeLocale } from "@/lib/i18n";

const copy = {
  en: {
    greeting: (name: string) => `Hello ${name},`,
    otpSubject: "Your Naksharix verification code",
    otpIntro: "Your Naksharix verification code is",
    otpExpiry: (minutes: number) => `This code expires in ${minutes} minutes.`,
    otpPrivate: "Do not share this code with anyone.",
    otpUnrequested: "If you did not create a Naksharix account, you can ignore this email.",
    resetSubject: "Reset your Naksharix password",
    resetIntro: (minutes: number) => `A password reset was requested for your Naksharix account. Open this private one-time link within ${minutes} minutes:`,
    resetPrivate: "Do not forward this link. If you did not request a reset, ignore this email. No password has changed."
  },
  hi: {
    greeting: (name: string) => name ? `नमस्ते ${name},` : "नमस्ते,",
    otpSubject: "आपका नक्षरिक्स सत्यापन कोड",
    otpIntro: "आपका नक्षरिक्स सत्यापन कोड है",
    otpExpiry: (minutes: number) => `यह कोड ${minutes} मिनट तक मान्य है।`,
    otpPrivate: "यह कोड किसी के साथ साझा न करें।",
    otpUnrequested: "यदि आपने नक्षरिक्स खाता नहीं बनाया है, तो इस ईमेल को अनदेखा कर दें।",
    resetSubject: "अपने नक्षरिक्स खाते का पासवर्ड रीसेट करें",
    resetIntro: (minutes: number) => `आपके नक्षरिक्स खाते का पासवर्ड रीसेट करने का अनुरोध मिला है। यह निजी लिंक केवल एक बार इस्तेमाल किया जा सकता है। इसे ${minutes} मिनट के भीतर खोलें।`,
    resetPrivate: "यह लिंक किसी को न भेजें। यदि आपने अनुरोध नहीं किया था, तो इस ईमेल को अनदेखा कर दें। आपका पासवर्ड अभी भी वही है।"
  },
  hinglish: {
    greeting: (name: string) => name ? `Namaste ${name},` : "Namaste,",
    otpSubject: "Aapka Naksharix verification code",
    otpIntro: "Aapka Naksharix verification code hai",
    otpExpiry: (minutes: number) => `Yeh code ${minutes} minute tak valid hai.`,
    otpPrivate: "Yeh code kisi ke saath share na karein.",
    otpUnrequested: "Agar aapne Naksharix account nahi banaya hai, to is email ko ignore karein.",
    resetSubject: "Apne Naksharix account ka password reset karein",
    resetIntro: (minutes: number) => `Aapke Naksharix account ka password reset karne ki request mili hai. Yeh private link sirf ek baar use hoga. Ise ${minutes} minute ke andar kholein.`,
    resetPrivate: "Yeh link kisi ko forward na karein. Agar aapne reset request nahi ki thi, to is email ko ignore karein. Aapka password abhi bhi wahi hai."
  }
};

export function verificationEmailMessage(locale: string | undefined, name: string | null | undefined, code: string, minutes: number) {
  const language = normalizeLocale(locale);
  const message = copy[language];
  const recipient = name?.trim() || (language === "en" ? "Naksharix user" : "");
  return {
    subject: message.otpSubject,
    text: [message.greeting(recipient), `${message.otpIntro}: ${code}`, message.otpExpiry(minutes) + "\n" + message.otpPrivate, message.otpUnrequested].join("\n\n")
  };
}

export function passwordResetEmailMessage(locale: string, name: string, link: URL, minutes: number) {
  const message = copy[normalizeLocale(locale)];
  return {
    subject: message.resetSubject,
    text: [message.greeting(name), message.resetIntro(minutes) + "\n" + link.toString(), message.resetPrivate].join("\n\n")
  };
}
