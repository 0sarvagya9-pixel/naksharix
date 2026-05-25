import type { Locale } from "@/lib/i18n";

const supportEmail = "care@naksharix.com";

export function requestCta(itemName: string, locale: Locale) {
  void itemName;
  void locale;
  return { href: "/contact", external: false, labelKey: "contact" as const };
}

export function productRequestCta(productName: string, locale: Locale) {
  void productName;
  void locale;
  return { href: "/contact", external: false, labelKey: "contact" as const };
}

export function requestMessage(itemName: string, locale: Locale) {
  if (locale === "hi") return `नमस्ते Naksharix, मैं ${itemName} के बारे में जानकारी चाहता/चाहती हूँ। कृपया सुरक्षित अगले चरणों के लिए मार्गदर्शन करें।`;
  if (locale === "hinglish") return `Namaste Naksharix, mujhe ${itemName} ke baare mein details chahiye. Please safe next steps ke liye guide karein.`;
  return `Hello Naksharix, I want to discuss ${itemName}. Please guide me with safe next steps.`;
}

export function contactHref() {
  return `mailto:${supportEmail}`;
}
