import type { Locale } from "@/lib/i18n";

const supportEmail = "care@naksharix.com";

export function requestCta(itemName: string, locale: Locale) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, "");
  const message = encodeURIComponent(requestMessage(itemName, locale));
  if (number) {
    return { href: `https://wa.me/${number}?text=${message}`, external: true, labelKey: "whatsapp" as const };
  }
  return { href: "/contact", external: false, labelKey: "contact" as const };
}

export function productRequestCta(productName: string, locale: Locale) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^\d]/g, "");
  const message = encodeURIComponent(productRequestMessage(productName, locale));
  if (number) {
    return { href: `https://wa.me/${number}?text=${message}`, external: true, labelKey: "whatsapp" as const };
  }
  return { href: "/contact", external: false, labelKey: "contact" as const };
}

export function requestMessage(itemName: string, locale: Locale) {
  if (locale === "hi") return `नमस्ते Naksharix, मैं ${itemName} के लिए अनुरोध करना चाहता/चाहती हूँ। कृपया विवरण और भुगतान पुष्टि के लिए मार्गदर्शन करें।`;
  if (locale === "hinglish") return `Namaste Naksharix, mujhe ${itemName} request karni hai. Please details aur payment confirmation ke liye guide karein.`;
  return `Hello Naksharix, I want to request the ${itemName}. Please guide me with details and payment confirmation.`;
}

function productRequestMessage(productName: string, locale: Locale) {
  if (locale === "hi") return `नमस्ते Naksharix, मैं ${productName} के बारे में जानकारी चाहता/चाहती हूँ। कृपया उपलब्धता और विवरण बताएं।`;
  if (locale === "hinglish") return `Namaste Naksharix, mujhe ${productName} ke baare mein details chahiye. Please availability aur details guide karein.`;
  return `Hello Naksharix, I want to know more about ${productName}. Please guide me with availability and details.`;
}

export function contactHref() {
  return `mailto:${supportEmail}`;
}
