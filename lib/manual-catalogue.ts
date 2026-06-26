import type { Locale } from "@/lib/i18n";

export type CatalogueText = Record<Locale, string>;
export type ProductStatus = "active" | "inactive";
export type ShopProduct = {
  id: string;
  slug: string;
  category: string;
  purpose: string;
  name: CatalogueText;
  shortDescription: CatalogueText;
  longDescription: CatalogueText;
  imageUrl: string;
  imageAlt: CatalogueText;
  priceLabel: CatalogueText;
  status: ProductStatus;
  featured: boolean;
  tags: string[];
  howToUse: CatalogueText;
  careNote: CatalogueText;
  disclaimer: CatalogueText;
  createdAt: string;
  updatedAt: string;
};

export type ManualReport = {
  slug: string;
  category: string;
  name: CatalogueText;
  description: CatalogueText;
  includes: Record<Locale, string[]>;
  who: Record<Locale, string[]>;
  required: Record<Locale, string[]>;
  preview: CatalogueText;
};

export const shopCategories = [
  { key: "rudraksha", en: "Rudraksha", hi: "रुद्राक्ष", hinglish: "Rudraksha" },
  { key: "gemstones", en: "Gemstones", hi: "रत्न", hinglish: "Gemstones" },
  { key: "bracelets", en: "Bracelets", hi: "ब्रेसलेट", hinglish: "Bracelets" },
  { key: "yantras", en: "Yantras", hi: "यंत्र", hinglish: "Yantras" },
  { key: "mala", en: "Mala", hi: "माला", hinglish: "Mala" },
  { key: "kavach", en: "Kavach / Combo", hi: "कवच / कॉम्बो", hinglish: "Kavach / Combo" },
  { key: "zodiac", en: "Zodiac Products", hi: "राशि उत्पाद", hinglish: "Zodiac Products" },
  { key: "report-remedy", en: "Report + Remedy Combo", hi: "रिपोर्ट + उपाय कॉम्बो", hinglish: "Report + Remedy Combo" }
] as const;

export const shopPurposes = ["Career", "Wealth", "Love", "Protection", "Focus", "Peace", "Health", "Spiritual Growth"] as const;
export const shopProductStorageKey = "naksharix-shop-products";

export const shopProducts: ShopProduct[] = [
  product("5-mukhi-rudraksha", "rudraksha", "Peace", "5 Mukhi Rudraksha", "५ मुखी रुद्राक्ष", "5 Mukhi Rudraksha", "A classic rudraksha for calm, discipline, and daily spiritual grounding.", "शांति, अनुशासन और दैनिक आध्यात्मिक स्थिरता के लिए पारंपरिक रुद्राक्ष।", "Calm, discipline aur daily spiritual grounding ke liye classic rudraksha."),
  product("7-mukhi-rudraksha", "rudraksha", "Wealth", "7 Mukhi Rudraksha", "७ मुखी रुद्राक्ष", "7 Mukhi Rudraksha", "A faith-based support item traditionally connected with prosperity discipline.", "समृद्धि अनुशासन से जुड़ा आस्था-आधारित सहयोगी साधन।", "Prosperity discipline se connected faith-based support item."),
  product("dhan-yog-bracelet", "bracelets", "Wealth", "Dhan Yog Bracelet", "धन योग ब्रेसलेट", "Dhan Yog Bracelet", "A symbolic bracelet for money focus, saving discipline, and steady intention.", "धन focus, saving discipline और स्थिर संकल्प के लिए प्रतीकात्मक ब्रेसलेट।", "Money focus, saving discipline aur steady intention ke liye symbolic bracelet."),
  product("amethyst-focus-bracelet", "bracelets", "Focus", "Amethyst Focus Bracelet", "एमेथिस्ट फोकस ब्रेसलेट", "Amethyst Focus Bracelet", "A reflective support bracelet for concentration, calm thinking, and study rhythm.", "एकाग्रता, शांत सोच और अध्ययन rhythm के लिए चिंतनात्मक सहयोग।", "Concentration, calm thinking aur study rhythm ke liye reflective support bracelet."),
  product("citrine-wealth-bracelet", "bracelets", "Wealth", "Citrine Wealth Bracelet", "सिट्रीन वेल्थ ब्रेसलेट", "Citrine Wealth Bracelet", "A bright prosperity-themed bracelet for confidence and practical money habits.", "आत्मविश्वास और practical money habits के लिए prosperity-themed ब्रेसलेट।", "Confidence aur practical money habits ke liye prosperity-themed bracelet."),
  product("black-tourmaline-protection", "bracelets", "Protection", "Black Tourmaline Protection Bracelet", "ब्लैक टूरमलाइन प्रोटेक्शन ब्रेसलेट", "Black Tourmaline Protection Bracelet", "A grounding bracelet traditionally used as a reminder of energetic boundaries.", "ऊर्जात्मक boundaries की याद दिलाने वाला grounding ब्रेसलेट।", "Energetic boundaries ke reminder ke roop mein grounding bracelet."),
  product("shri-yantra", "yantras", "Spiritual Growth", "Shri Yantra", "श्री यंत्र", "Shri Yantra", "A sacred geometry tool for devotion, focus, and prosperity intention.", "भक्ति, ध्यान और समृद्धि संकल्प के लिए sacred geometry साधन।", "Devotion, focus aur prosperity intention ke liye sacred geometry tool."),
  product("mahamrityunjaya-yantra", "yantras", "Health", "Mahamrityunjaya Yantra", "महामृत्युंजय यंत्र", "Mahamrityunjaya Yantra", "A devotional yantra for prayer, resilience, and reflective wellness support.", "प्रार्थना, धैर्य और wellness reflection के लिए devotional यंत्र।", "Prayer, resilience aur wellness reflection ke liye devotional yantra."),
  product("rudraksha-mala", "mala", "Peace", "Rudraksha Mala", "रुद्राक्ष माला", "Rudraksha Mala", "A mala for mantra practice, meditation rhythm, and devotional discipline.", "मंत्र अभ्यास, ध्यान rhythm और devotional discipline के लिए माला।", "Mantra practice, meditation rhythm aur devotional discipline ke liye mala."),
  product("zodiac-energy-bracelet", "zodiac", "Spiritual Growth", "Zodiac Energy Bracelet", "राशि एनर्जी ब्रेसलेट", "Zodiac Energy Bracelet", "A zodiac-themed bracelet selected as symbolic reflective support.", "राशि-आधारित प्रतीकात्मक चिंतनात्मक सहयोग के लिए ब्रेसलेट।", "Zodiac-themed symbolic reflective support bracelet."),
  product("career-growth-combo", "report-remedy", "Career", "Career Growth Remedy Combo", "करियर ग्रोथ उपाय कॉम्बो", "Career Growth Remedy Combo", "A report-aligned remedy bundle for focus, timing reflection, and work discipline.", "focus, timing reflection और work discipline के लिए report-aligned remedy bundle।", "Focus, timing reflection aur work discipline ke liye report-aligned remedy bundle."),
  product("relationship-harmony-combo", "kavach", "Love", "Relationship Harmony Combo", "संबंध सामंजस्य कॉम्बो", "Relationship Harmony Combo", "A gentle symbolic combo for communication, patience, and emotional balance.", "संवाद, धैर्य और भावनात्मक संतुलन के लिए gentle symbolic combo।", "Communication, patience aur emotional balance ke liye gentle symbolic combo.")
];

export const manualReports: ManualReport[] = [
  report("premium-kundli", "Kundli", "Premium Personalized Kundli Report", "प्रीमियम व्यक्तिगत कुंडली रिपोर्ट", "Premium Personalized Kundli Report"),
  report("couple-kundli", "Matching", "Couple Kundli / Match Making Report", "कपल कुंडली / मिलान रिपोर्ट", "Couple Kundli / Match Making Report"),
  report("career-report", "Career", "Career Report", "करियर रिपोर्ट", "Career Report"),
  report("wealth-report", "Wealth", "Wealth Report", "धन रिपोर्ट", "Wealth Report"),
  report("love-report", "Relationship", "Love / Relationship Report", "प्रेम / संबंध रिपोर्ट", "Love / Relationship Report"),
  report("baby-name-report", "Name", "Baby Name Report", "बेबी नाम रिपोर्ट", "Baby Name Report"),
  report("sade-sati-report", "Transit", "Sade Sati Report", "साढ़े साती रिपोर्ट", "Sade Sati Report"),
  report("manglik-kaal-sarp-report", "Dosha", "Manglik / Kaal Sarp Report", "मांगलिक / काल सर्प रिपोर्ट", "Manglik / Kaal Sarp Report"),
  report("numerology-lo-shu-report", "Numerology", "Numerology + Lo Shu Report", "अंक ज्योतिष + लो शू रिपोर्ट", "Numerology + Lo Shu Report"),
  report("name-correction-report", "Name", "Name Correction Report", "नाम सुधार रिपोर्ट", "Name Correction Report"),
  report("yearly-horoscope-report", "Yearly", "Yearly Horoscope Report", "वार्षिक राशिफल रिपोर्ट", "Yearly Horoscope Report"),
  report("transit-report", "Transit", "Transit Report", "गोचर रिपोर्ट", "Transit Report"),
  report("rahu-ketu-report", "Transit", "Rahu Ketu Report", "राहु केतु रिपोर्ट", "Rahu Ketu Report"),
  report("jupiter-transit-report", "Transit", "Jupiter Transit Report", "गुरु गोचर रिपोर्ट", "Jupiter Transit Report"),
  report("fortune-report", "Fortune", "Fortune Report", "भाग्य रिपोर्ट", "Fortune Report")
];

export function getManualReport(slug: string) {
  return manualReports.find((item) => item.slug === slug || legacyReportSlugs[slug] === item.slug);
}

export function categoryLabel(category: string, locale: Locale) {
  const match = shopCategories.find((item) => item.key === category);
  return match ? match[locale] : category;
}

export function normalizeShopProducts(value: unknown): ShopProduct[] {
  if (!Array.isArray(value)) return shopProducts;
  const normalized = value
    .map((item) => normalizeShopProduct(item))
    .filter((item): item is ShopProduct => Boolean(item));
  return normalized.length ? normalized : shopProducts;
}

export function emptyShopProduct(): ShopProduct {
  const now = new Date().toISOString();
  return {
    id: "",
    slug: "",
    category: shopCategories[0].key,
    purpose: shopPurposes[0],
    name: text(""),
    shortDescription: text(""),
    longDescription: text(""),
    imageUrl: "",
    imageAlt: text(""),
    priceLabel: {
      en: "Price on request",
      hi: "Price on request",
      hinglish: "Price on request"
    },
    status: "active",
    featured: false,
    tags: [],
    howToUse: text(""),
    careNote: text(""),
    disclaimer: productDisclaimer(),
    createdAt: now,
    updatedAt: now
  };
}

function product(id: string, category: string, purpose: string, en: string, hi: string, hinglish: string, descEn: string, descHi: string, descHinglish: string): ShopProduct {
  const now = "2026-05-24T00:00:00.000Z";
  const purposeTag = purpose.toLowerCase().replace(/\s+/g, "-");
  return {
    id,
    slug: id,
    category,
    purpose,
    name: { en, hi, hinglish },
    shortDescription: { en: descEn, hi: descHi, hinglish: descHinglish },
    longDescription: {
      en: `${descEn} It is offered as a reflective, faith-based catalogue item and should be selected with guidance, practical judgment, and personal comfort.`,
      hi: `${descHi} इसे चिंतनात्मक, आस्था-आधारित catalogue item के रूप में देखें और guidance, practical judgment और personal comfort के साथ चुनें।`,
      hinglish: `${descHinglish} Ise reflective, faith-based catalogue item ke roop mein dekhein aur guidance, practical judgment aur personal comfort ke saath choose karein.`
    },
    imageUrl: `/shop/${placeholderImageForCategory(category)}.svg`,
    imageAlt: { en: `${en} product visual`, hi: `${hi} उत्पाद visual`, hinglish: `${hinglish} product visual` },
    priceLabel: {
      en: "Price on request",
      hi: "Price on request",
      hinglish: "Price on request"
    },
    status: "active",
    featured: ["5-mukhi-rudraksha", "dhan-yog-bracelet", "shri-yantra", "career-growth-combo"].includes(id),
    tags: [category, purposeTag],
    howToUse: {
      en: "May support mindful practice, intention-setting, and a calmer routine when used with practical judgment.",
      hi: "व्यावहारिक समझ के साथ उपयोग करने पर mindful practice, संकल्प और शांत routine में सहयोगी माना जा सकता है।",
      hinglish: "Practical judgment ke saath use karne par mindful practice, intention-setting aur calm routine ko support kar sakta hai."
    },
    careNote: {
      en: "Keep it clean and dry. Use respectfully as a faith-based support item, not as a guarantee.",
      hi: "इसे साफ और सूखा रखें। इसे आस्था-आधारित सहयोग के रूप में उपयोग करें, guarantee के रूप में नहीं।",
      hinglish: "Ise clean aur dry rakhein. Faith-based support ke roop mein use karein, guarantee ke roop mein nahi."
    },
    disclaimer: productDisclaimer(),
    createdAt: now,
    updatedAt: now
  };
}

function normalizeShopProduct(item: unknown): ShopProduct | null {
  if (!item || typeof item !== "object") return null;
  const source = item as Partial<ShopProduct> & { description?: CatalogueText; support?: CatalogueText; care?: CatalogueText };
  const name = safeText(source.name);
  const id = safeString(source.id || source.slug || name.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  if (!id || !name.en) return null;
  const now = new Date().toISOString();
  const priceLabel = safeText(source.priceLabel);
  const disclaimer = safeText(source.disclaimer);
  return {
    id,
    slug: safeString(source.slug) || id,
    category: safeString(source.category) || shopCategories[0].key,
    purpose: safeString(source.purpose) || shopPurposes[0],
    name,
    shortDescription: safeText(source.shortDescription || source.description),
    longDescription: safeText(source.longDescription || source.shortDescription || source.description),
    imageUrl: safeString(source.imageUrl),
    imageAlt: safeText(source.imageAlt || source.name),
    priceLabel: priceLabel.en ? priceLabel : text("Price on request"),
    status: source.status === "inactive" ? "inactive" : "active",
    featured: Boolean(source.featured),
    tags: Array.isArray(source.tags) ? source.tags.map((tag) => safeString(tag)).filter(Boolean) : [],
    howToUse: safeText(source.howToUse || source.support),
    careNote: safeText(source.careNote || source.care),
    disclaimer: disclaimer.en ? disclaimer : productDisclaimer(),
    createdAt: safeString(source.createdAt) || now,
    updatedAt: safeString(source.updatedAt) || now
  };
}

function productDisclaimer(): CatalogueText {
  return {
    en: "Spiritual products are faith-based and reflective support tools. They do not guarantee outcomes and do not replace medical, legal, financial, or professional advice.",
    hi: "आध्यात्मिक उत्पाद आस्था-आधारित और चिंतनात्मक सहयोग के साधन हैं। ये परिणामों की गारंटी नहीं देते और चिकित्सा, कानूनी, वित्तीय या पेशेवर सलाह का विकल्प नहीं हैं।",
    hinglish: "Spiritual products faith-based aur reflective support tools hain. Ye promised outcomes nahi dete aur medical, legal, financial ya professional advice ka replacement nahi hain."
  };
}

function placeholderImageForCategory(category: string) {
  if (category === "rudraksha") return "rudraksha-placeholder";
  if (category === "gemstones") return "gemstone-placeholder";
  if (category === "bracelets" || category === "zodiac") return "bracelet-placeholder";
  if (category === "yantras") return "yantra-placeholder";
  if (category === "mala") return "mala-placeholder";
  return "combo-placeholder";
}

function text(value: string): CatalogueText {
  return { en: value, hi: value, hinglish: value };
}

function safeText(value: unknown): CatalogueText {
  if (!value || typeof value !== "object") return text("");
  const source = value as Partial<CatalogueText>;
  const en = safeString(source.en || source.hinglish || source.hi);
  return {
    en,
    hi: safeString(source.hi || en),
    hinglish: safeString(source.hinglish || en)
  };
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function report(slug: string, category: string, en: string, hi: string, hinglish: string): ManualReport {
  return {
    slug,
    category,
    name: { en, hi, hinglish },
    description: {
      en: `${en} prepared manually for deeper reflective guidance using the details you share.`,
      hi: `${hi} आपके साझा किए गए विवरणों के आधार पर गहरे चिंतनात्मक मार्गदर्शन के लिए मैन्युअल रूप से तैयार की जाती है।`,
      hinglish: `${hinglish} aapke shared details ke basis par deeper reflective guidance ke liye manually prepare hoti hai.`
    },
    includes: {
      en: ["Personalized analysis", "Key strengths and caution areas", "Practical guidance", "Gentle remedies or reflection prompts"],
      hi: ["व्यक्तिगत विश्लेषण", "मुख्य strengths और caution areas", "व्यावहारिक मार्गदर्शन", "सरल उपाय या reflection prompts"],
      hinglish: ["Personalized analysis", "Key strengths aur caution areas", "Practical guidance", "Gentle remedies ya reflection prompts"]
    },
    who: {
      en: ["Users seeking deeper clarity", "Families reviewing important decisions", "Anyone who wants a calm written report"],
      hi: ["गहरी स्पष्टता चाहने वाले users", "महत्वपूर्ण निर्णय review करने वाले परिवार", "शांत लिखित report चाहने वाले लोग"],
      hinglish: ["Deeper clarity chahne wale users", "Important decisions review karne wali families", "Calm written report chahne wale log"]
    },
    required: {
      en: slug === "couple-kundli" ? ["Bride details", "Groom details", "Main relationship question"] : slug === "name-correction-report" ? ["Current name", "Date of birth", "Preferred language"] : ["Name", "Date of birth", "Time of birth", "Birth place", "Main question"],
      hi: slug === "couple-kundli" ? ["वधू विवरण", "वर विवरण", "मुख्य संबंध प्रश्न"] : slug === "name-correction-report" ? ["वर्तमान नाम", "जन्म तिथि", "पसंदीदा भाषा"] : ["नाम", "जन्म तिथि", "जन्म समय", "जन्म स्थान", "मुख्य प्रश्न"],
      hinglish: slug === "couple-kundli" ? ["Bride details", "Groom details", "Main relationship question"] : slug === "name-correction-report" ? ["Current name", "Date of birth", "Preferred language"] : ["Name", "Date of birth", "Time of birth", "Birth place", "Main question"]
    },
    preview: {
      en: "A premium written report with structured sections, calm guidance, and practical next steps.",
      hi: "संरचित sections, शांत guidance और practical next steps के साथ premium written report।",
      hinglish: "Structured sections, calm guidance aur practical next steps ke saath premium written report."
    }
  };
}

const legacyReportSlugs: Record<string, string> = {
  "kundli-pro": "premium-kundli",
  "marriage-report": "couple-kundli",
  "finance-report": "wealth-report",
  "health-report": "premium-kundli",
  "yearly-ai": "yearly-horoscope-report",
  "numerology-report": "numerology-lo-shu-report"
};
