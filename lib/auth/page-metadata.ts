import type { Metadata } from "next";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import { authPageCopy } from "@/lib/auth/auth-page-copy";
import { verificationCopy } from "@/lib/auth/verification-copy";

const translations = {
  hi: {
    login: [authPageCopy.hi.login, "अपने खाते, सहेजी गई कुंडली, रिपोर्ट और बुकिंग देखने के लिए ईमेल या Google से साइन इन करें।"],
    signup: [authPageCopy.hi.signup, "अपनी रीडिंग, डिजिटल रिपोर्ट और परामर्श बुकिंग सहेजने के लिए नक्षरिक्स खाता बनाएँ।"],
    professional: [authPageCopy.hi.professional, "अपनी प्रोफ़ाइल, उपलब्धता, बुकिंग और कमाई देखने के लिए पेशेवर खाते में साइन इन करें।"],
    recovery: ["अपना खाता पुनः प्राप्त करें", ""],
    reset: ["अपना पासवर्ड रीसेट करें", ""],
    verification: [verificationCopy.hi.title, "अपने नक्षरिक्स खाते का ईमेल पता सत्यापित करें।"]
  },
  hinglish: {
    login: [authPageCopy.hinglish.login, "Apna account, saved Kundli, reports aur bookings dekhne ke liye email ya Google se sign in karein."],
    signup: [authPageCopy.hinglish.signup, "Apni readings, digital reports aur consultation bookings save karne ke liye Naksharix account banayein."],
    professional: ["Astrologer ya consultant account mein sign in karein", "Apni profile, availability, bookings aur earnings dekhne ke liye professional account mein sign in karein."],
    recovery: ["Apna account recover karein", ""],
    reset: ["Apna password reset karein", ""],
    verification: [verificationCopy.hinglish.title, "Apne Naksharix account ka email address verify karein."]
  }
} as const;

export async function localizedAuthMetadata(page: keyof typeof translations.hi, english: Metadata): Promise<Metadata> {
  const language = normalizeLocale((await cookies()).get("naksharix-language")?.value);
  if (language === "en") return english;
  const [title, description] = translations[language][page];
  return {
    ...english,
    title,
    ...(description ? { description } : {}),
    ...(english.openGraph ? { openGraph: { ...english.openGraph, title, description } } : {}),
    ...(english.twitter ? { twitter: { ...english.twitter, title, description } } : {})
  };
}
