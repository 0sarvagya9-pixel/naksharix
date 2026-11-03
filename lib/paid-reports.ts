export const paidReports = [
  {
    id: "kundli-pro",
    purpose: "KUNDLI_REPORT",
    name: "Premium Kundli Report",
    price: "INR 799",
    amount: 799,
    priceEnv: "STRIPE_KUNDLI_REPORT_PRICE_ID",
    description: "Detailed birth chart, planetary positions, lagna, navamsa, dasha insights, yog analysis, dosha review, and remedial guidance.",
    features: ["Birth details and chart summary", "Planets, houses, lagna and navamsa", "Dasha, yogas, doshas and remedies", "Download-ready PDF template"],
    sample: ["Ascendant temperament overview", "Strong and weak planet notes", "Remedy plan for the next 30 days"],
    faqs: ["Does this include Manglik analysis?", "Can I use this for career and marriage timing?", "Is the report downloadable?"]
  },
  {
    id: "career-report",
    purpose: "KUNDLI_REPORT",
    name: "Career Astrology Report",
    price: "INR 599",
    amount: 599,
    priceEnv: "STRIPE_CAREER_REPORT_PRICE_ID",
    description: "Career strengths, work timing, leadership style, professional risks, and practical growth recommendations.",
    features: ["Career house analysis", "Planet strength for work", "Growth windows", "Practical upskilling remedies"],
    sample: ["Best-fit work themes", "Timing for role change", "Communication and leadership notes"],
    faqs: ["Can this predict an exact job?", "Does it include business guidance?", "Will it suggest remedies?"]
  },
  {
    id: "marriage-report",
    purpose: "MATCH_REPORT",
    name: "Marriage Report",
    price: "INR 699",
    amount: 699,
    priceEnv: "STRIPE_MARRIAGE_REPORT_PRICE_ID",
    description: "Marriage timing themes, compatibility factors, emotional patterns, Manglik context, and relationship remedies.",
    features: ["Relationship house review", "Marriage timing themes", "Manglik and dosha context", "Practical harmony remedies"],
    sample: ["Communication pattern", "Family alignment notes", "Recommended discussion checklist"],
    faqs: ["Is this the same as kundli matching?", "Can it help with timing?", "Does it include remedies?"]
  },
  {
    id: "finance-report",
    purpose: "KUNDLI_REPORT",
    name: "Finance Report",
    price: "INR 599",
    amount: 599,
    priceEnv: "STRIPE_FINANCE_REPORT_PRICE_ID",
    description: "Wealth patterns, risk temperament, savings discipline, earning windows, and grounded money guidance.",
    features: ["Wealth house summary", "Income and expense themes", "Risk and discipline notes", "Money ritual plan"],
    sample: ["Financial habit diagnosis", "Favorable planning windows", "Spending caution periods"],
    faqs: ["Is this financial advice?", "Can it replace a planner?", "Does it include lucky dates?"]
  },
  {
    id: "health-report",
    purpose: "KUNDLI_REPORT",
    name: "Health Astrology Report",
    price: "INR 499",
    amount: 499,
    priceEnv: "STRIPE_HEALTH_REPORT_PRICE_ID",
    description: "Wellness tendencies, stress rhythms, daily routine suggestions, and ethical non-medical astrology guidance.",
    features: ["Wellness pattern overview", "Stress and recovery themes", "Routine recommendations", "Gentle spiritual remedies"],
    sample: ["Sleep and routine focus", "Energy management note", "Mind-body habit suggestions"],
    faqs: ["Is this medical advice?", "Should I see a doctor?", "Does it include lifestyle tips?"]
  },
  {
    id: "yearly-ai",
    purpose: "YEARLY_REPORT",
    name: "Yearly Prediction Report 2026",
    price: "INR 999",
    amount: 999,
    priceEnv: "STRIPE_YEARLY_REPORT_PRICE_ID",
    description: "A personalized annual astrology report combining horoscope patterns, numerology, transits, and AI synthesis.",
    features: ["Month-by-month forecast", "Love, career, health and finance", "AI-generated remedies", "Lucky dates and colors"],
    sample: ["Quarterly themes", "Important decision months", "Yearly remedy plan"],
    faqs: ["Is it personalized?", "Does it cover all months?", "Can I regenerate later?"]
  },
  {
    id: "numerology-report",
    purpose: "KUNDLI_REPORT",
    name: "Numerology Report",
    price: "INR 399",
    amount: 399,
    priceEnv: "STRIPE_NUMEROLOGY_REPORT_PRICE_ID",
    description: "Life path, destiny, soul urge, personality number, name vibration, and daily numerology recommendations.",
    features: ["Life path and destiny number", "Soul urge and personality number", "Name correction guidance", "Daily numerology habits"],
    sample: ["Core number matrix", "Name vibration notes", "Lucky number routine"],
    faqs: ["Can I analyze my business name?", "Does it include mobile numbers?", "Can it suggest spelling changes?"]
  },
  {
    id: "love-relationship-report",
    purpose: "MATCH_REPORT",
    name: "Love / Relationship Report",
    price: "INR 499",
    amount: 499,
    priceEnv: "STRIPE_LOVE_RELATIONSHIP_REPORT_PRICE_ID",
    description: "Personalized relationship patterns, communication themes, timing context and practical supportive guidance. Prepared for manual review.",
    features: ["Relationship chart themes","Communication and emotional compatibility","Timing context","Practical reflection prompts"],
    sample: ["Relationship strengths","Areas for open communication","Grounded next steps"],
    faqs: ["Is this a relationship guarantee?","Does this include marriage timing?"]
  },
  {
    id: "baby-name-personalized",
    purpose: "KUNDLI_REPORT",
    name: "Baby Name Report",
    price: "INR 399",
    amount: 399,
    priceEnv: "STRIPE_BABY_NAME_PERSONALIZED_PRICE_ID",
    description: "Traditional birth-chart-informed baby name options and pronunciation notes, reviewed manually before delivery.",
    features: ["Birth nakshatra context","Name sound and meaning options","Family preference considerations","Personalized shortlist"],
    sample: ["Suggested starting sounds","Cultural meaning notes","Shortlist for family review"],
    faqs: ["Is the final name guaranteed to be lucky?","Can we provide preferred languages?"]
  },
  {
    id: "sade-sati-personalized",
    purpose: "KUNDLI_REPORT",
    name: "Sade Sati Report",
    price: "INR 399",
    amount: 399,
    priceEnv: "STRIPE_SADE_SATI_PERSONALIZED_PRICE_ID",
    description: "A personalized review of traditional Saturn transit periods, caution themes and non-deterministic coping guidance.",
    features: ["Moon and Saturn context","Transit phase overview","Grounded practical routines","Traditional reflective remedies"],
    sample: ["Period themes","Helpful routine prompts","Saturn transit context"],
    faqs: ["Does this predict certain events?","Can it substitute for professional advice?"]
  },
  {
    id: "manglik-kaal-sarp-personalized",
    purpose: "KUNDLI_REPORT",
    name: "Manglik / Kaal Sarp Report",
    price: "INR 499",
    amount: 499,
    priceEnv: "STRIPE_MANGLIK_KAAL_SARP_PERSONALIZED_PRICE_ID",
    description: "Personalized traditional dosha checks, chart context and interpretations, without certain predictions or prescribed guarantees.",
    features: ["Manglik context review","Kaal Sarp context review","Cancellation factors","Practical and gentle spiritual suggestions"],
    sample: ["Dosha review summary","Chart context cautions","Remedy considerations"],
    faqs: ["Will the report guarantee dosha removal?","Are chart details required?"]
  },
  {
    id: "name-correction-personalized",
    purpose: "KUNDLI_REPORT",
    name: "Name Correction Report",
    price: "INR 399",
    amount: 399,
    priceEnv: "STRIPE_NAME_CORRECTION_PERSONALIZED_PRICE_ID",
    description: "Name spelling and numerology-oriented reflective suggestions, based on the details submitted for manual review.",
    features: ["Current name interpretation","Number pattern context","Spelling options","Practical decision guidance"],
    sample: ["Name number snapshot","Alternate spelling themes","Practical caveats"],
    faqs: ["Is a legal name change required?","Can I submit a preferred name?"]
  },
  {
    id: "transit-personalized",
    purpose: "YEARLY_REPORT",
    name: "Transit Report",
    price: "INR 449",
    amount: 449,
    priceEnv: "STRIPE_TRANSIT_PERSONALIZED_PRICE_ID",
    description: "Personalized summary of relevant planetary transit themes and planning suggestions, prepared for a specific period.",
    features: ["Major transit overview","Context to birth chart","Planning themes","Reflection prompts"],
    sample: ["Transit themes by period","Areas for caution","Practical choices"],
    faqs: ["Does this report give exact event guarantees?","Which timeframe is covered?"]
  },
  {
    id: "rahu-ketu-personalized",
    purpose: "KUNDLI_REPORT",
    name: "Rahu Ketu Report",
    price: "INR 399",
    amount: 399,
    priceEnv: "STRIPE_RAHU_KETU_PERSONALIZED_PRICE_ID",
    description: "Traditional lunar-node chart and transit reading focused on patterns, choices and grounded guidance.",
    features: ["Rahu and Ketu context","House themes","Relevant transit background","Practical reflection prompts"],
    sample: ["Node axis themes","Potential blind spots","Thoughtful next steps"],
    faqs: ["Are these certainties?","Can birth details improve the analysis?"]
  },
  {
    id: "jupiter-transit-personalized",
    purpose: "YEARLY_REPORT",
    name: "Jupiter Transit Report",
    price: "INR 399",
    amount: 399,
    priceEnv: "STRIPE_JUPITER_TRANSIT_PERSONALIZED_PRICE_ID",
    description: "Personalized Guru/Jupiter transit themes with practical planning suggestions and traditional context.",
    features: ["Jupiter transit overview","Relevant chart houses","Learning and growth themes","Practical planning notes"],
    sample: ["Growth themes","Learning focus","Reflection prompts"],
    faqs: ["Does this promise gains or promotions?","Is an exact birth time useful?"]
  },
  {
    id: "fortune-personalized",
    purpose: "KUNDLI_REPORT",
    name: "Fortune Report",
    price: "INR 499",
    amount: 499,
    priceEnv: "STRIPE_FORTUNE_PERSONALIZED_PRICE_ID",
    description: "A structured traditional astrology reading of opportunities, personal habits, strengths and caution areas.",
    features: ["Birth-chart opportunities","Strength patterns","Timing context","Practical focus areas"],
    sample: ["Strength and caution themes","Grounded planning tips","Reflection checklist"],
    faqs: ["Are financial results guaranteed?","Is this professional financial advice?"]
  }
] as const;

export type PaidReportId = (typeof paidReports)[number]["id"];

export function getPaidReport(id: string) {
  return paidReports.find((report) => report.id === id);
}
