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
  }
] as const;

export type PaidReportId = (typeof paidReports)[number]["id"];

export function getPaidReport(id: string) {
  return paidReports.find((report) => report.id === id);
}
