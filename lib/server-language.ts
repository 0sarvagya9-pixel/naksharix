import { normalizeLocale, requiredMessages, type Locale } from "@/lib/i18n";

export type AiLanguage = "English" | "Hindi" | "Hinglish";

export function normalizeRequestLanguage(value: unknown): Locale | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "hindi") return "hi";
  if (normalized === "english") return "en";
  if (normalized === "hinglish") return "hinglish";
  const locale = normalizeLocale(normalized);
  return locale === "en" && normalized !== "en" ? undefined : locale;
}

export function readLanguageFromRequest(request: Request, explicit?: unknown): Locale {
  const fromBody = normalizeRequestLanguage(explicit);
  if (fromBody) return fromBody;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieValue = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("naksharix-language="))
    ?.split("=")[1];

  return normalizeLocale(cookieValue ? decodeURIComponent(cookieValue) : undefined);
}

export function toAiLanguage(locale: Locale): AiLanguage {
  if (locale === "hi") return "Hindi";
  if (locale === "hinglish") return "Hinglish";
  return "English";
}

export function translatedApiMessage(locale: Locale, key: "required" | "serviceUnavailable" | "limitReached" | "aiChatNotConfigured" | "pdfMissing" | "pdfFailed" | "generic") {
  const messages: Record<typeof key, Record<Locale, string>> = {
    required: requiredMessages,
    serviceUnavailable: {
      en: "Personalized calculation service is temporarily unavailable. Please try again later.",
      hi: "व्यक्तिगत गणना सेवा फिलहाल उपलब्ध नहीं है। कृपया बाद में फिर प्रयास करें।",
      hinglish: "Personalized calculation service abhi available nahi hai. Kripya baad me try karein."
    },
    limitReached: {
      en: "You have reached today's free limit.",
      hi: "आपने आज की मुफ्त सीमा पूरी कर ली है।",
      hinglish: "Aapne aaj ki free limit complete kar li hai."
    },
    aiChatNotConfigured: {
      en: "AI service is not configured yet. Please add GEMINI_API_KEY.",
      hi: "AI सेवा अभी कॉन्फ़िगर नहीं है। कृपया GEMINI_API_KEY जोड़ें।",
      hinglish: "AI service abhi configured nahi hai. Please GEMINI_API_KEY add karein."
    },
    pdfMissing: {
      en: "Report data is missing. Please regenerate the Kundli report and try again.",
      hi: "रिपोर्ट डेटा उपलब्ध नहीं है। कृपया कुंडली रिपोर्ट फिर से बनाकर प्रयास करें।",
      hinglish: "Report data missing hai. Kripya Kundli report dobara generate karke try karein."
    },
    pdfFailed: {
      en: "PDF generation failed. Please regenerate the Kundli report and try again.",
      hi: "PDF बन नहीं सकी। कृपया कुंडली रिपोर्ट फिर से बनाकर प्रयास करें।",
      hinglish: "PDF generate nahi ho paayi. Kripya Kundli report dobara generate karke try karein."
    },
    generic: {
      en: "We could not complete that request right now. Please try again.",
      hi: "हम अभी यह अनुरोध पूरा नहीं कर सके। कृपया फिर प्रयास करें।",
      hinglish: "Hum abhi ye request complete nahi kar paaye. Kripya phir try karein."
    }
  };

  return messages[key][locale];
}
