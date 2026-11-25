export const marketingInterests = [
  ["kundli", "Kundli reports"], ["matching", "Couple Kundli and matching"],
  ["numerology", "Numerology reports"], ["career", "Career reports"],
  ["yearly", "Yearly horoscope reports"], ["puja", "Puja service information"],
  ["reports", "Other digital reports"]
] as const;
export const marketingConsentVersion = "email-updates-v1-20261124";
export const marketingConsentText = "I am 18 or older and agree to receive optional Naksharix email updates and offers about my selected interest. My subscription is voluntary, and I can unsubscribe at any time.";
export function marketingInterestLabel(id: string) {
  return marketingInterests.find(([value]) => value === id)?.[1] ?? "Unknown";
}

export type MarketingLocale = "en" | "hi" | "hinglish";
export function normalizeMarketingLocale(value: unknown): MarketingLocale {
  return value === "hi" || value === "hinglish" ? value : "en";
}

/** An HTTP success or opposite-action boolean cannot establish a saved preference. */
export function marketingConsentAcknowledged(action: "subscribe" | "unsubscribe", value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const result = value as { subscribed?: unknown; confirmedAt?: unknown };
  if (action === "unsubscribe") return result.subscribed === false;
  if (result.subscribed !== true || typeof result.confirmedAt !== "string") return false;
  const time = Date.parse(result.confirmedAt);
  return Number.isFinite(time) && new Date(time).toISOString() === result.confirmedAt;
}

export const marketingPreferenceCopy = {
  en: {
    active: "Your website email permission is recorded.", inactive: "You are not subscribed to website email updates.",
    interest: "Interested in", choose: "Choose an interest", country: "Country (optional)", language: "Email language",
    consent: marketingConsentText, save: "Save email preferences", subscribe: "Subscribe to updates", withdraw: "Withdraw email permission",
    saved: "Your website email permission has been recorded. Email delivery is not confirmed.",
    withdrawn: "Your website marketing permission has been withdrawn. External email-provider suppression is verified separately.",
    unconfirmed: "The saved preference could not be confirmed. Refresh this page before subscribing again; withdrawal remains available.",
    refresh: "Refresh preferences", saving: "Saving…",
    labels: ["Kundli reports", "Couple Kundli and matching", "Numerology reports", "Career reports", "Yearly horoscope reports", "Puja service information", "Other digital reports"]
  },
  hi: {
    active: "वेबसाइट पर ईमेल की आपकी अनुमति दर्ज है।", inactive: "आप वेबसाइट के ईमेल अपडेट के लिए सदस्य नहीं हैं।",
    interest: "आपकी रुचि", choose: "रुचि चुनें", country: "देश (वैकल्पिक)", language: "ईमेल की भाषा",
    consent: "मेरी आयु 18 वर्ष या अधिक है और मैं चुनी हुई रुचि से संबंधित वैकल्पिक Naksharix ईमेल अपडेट और ऑफ़र प्राप्त करने की अनुमति देता/देती हूँ। सदस्यता स्वैच्छिक है और मैं किसी भी समय इसे बंद कर सकता/सकती हूँ।",
    save: "ईमेल प्राथमिकताएँ सहेजें", subscribe: "अपडेट की सदस्यता लें", withdraw: "ईमेल की अनुमति वापस लें",
    saved: "वेबसाइट पर ईमेल की आपकी अनुमति दर्ज हो गई है। ईमेल पहुँचने की पुष्टि नहीं हुई है।",
    withdrawn: "वेबसाइट पर मार्केटिंग की अनुमति वापस ले ली गई है। बाहरी ईमेल सेवा पर रोक की पुष्टि अलग से होती है।",
    unconfirmed: "सहेजी गई प्राथमिकता की पुष्टि नहीं हो सकी। दोबारा सदस्यता लेने से पहले पेज रीफ़्रेश करें; अनुमति वापस लेने का विकल्प उपलब्ध है।",
    refresh: "प्राथमिकताएँ रीफ़्रेश करें", saving: "सहेज रहे हैं…",
    labels: ["कुंडली रिपोर्ट", "युगल कुंडली और मिलान", "अंक ज्योतिष रिपोर्ट", "करियर रिपोर्ट", "वार्षिक राशिफल रिपोर्ट", "पूजा सेवा की जानकारी", "अन्य डिजिटल रिपोर्ट"]
  },
  hinglish: {
    active: "Website par aapki email permission record hai.", inactive: "Aap website email updates ke subscriber nahi hain.",
    interest: "Aapki interest", choose: "Interest select karein", country: "Country (optional)", language: "Email language",
    consent: "Main 18 saal ya usse zyada umra ka/ki hoon aur apni selected interest se related optional Naksharix email updates aur offers receive karne ki permission deta/deti hoon. Subscription voluntary hai aur main kabhi bhi unsubscribe kar sakta/sakti hoon.",
    save: "Email preferences save karein", subscribe: "Updates subscribe karein", withdraw: "Email permission wapas lein",
    saved: "Website email permission record ho gayi hai. Email delivery confirm nahi hui hai.",
    withdrawn: "Website marketing permission wapas le li gayi hai. External email provider par suppression alag se verify hoti hai.",
    unconfirmed: "Saved preference confirm nahi ho saki. Dobara subscribe karne se pehle page refresh karein; permission wapas lene ka option available hai.",
    refresh: "Preferences refresh karein", saving: "Save ho raha hai…",
    labels: ["Kundli reports", "Couple Kundli aur matching", "Numerology reports", "Career reports", "Yearly horoscope reports", "Puja service ki information", "Other digital reports"]
  }
} as const;
