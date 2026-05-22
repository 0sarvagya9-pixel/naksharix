import type { AstrologyBirthInput, BirthChartData, KundliReport } from "@/lib/astrology/types";
import { enrichBirthChartWithCoreCalculations } from "@/lib/astrology/core-calculations";

export function normalizeBirthInput(input: AstrologyBirthInput): AstrologyBirthInput {
  return {
    ...input,
    name: input.name.trim(),
    gender: input.gender?.trim() || "Prefer not to say",
    birthPlace: input.birthPlace.trim(),
    latitude: Number(input.latitude),
    longitude: Number(input.longitude),
    timezone: input.timezone || "Asia/Kolkata",
    language: input.language ?? input.locale ?? "en"
  };
}

export function buildKundliReport(input: AstrologyBirthInput, chart: BirthChartData, aiSummary: string): KundliReport {
  const language = input.language ?? input.locale ?? "en";
  const enrichedChart = enrichBirthChartWithCoreCalculations(chart, input);
  const copy = kundliReportCopy(language, enrichedChart);
  return {
    reportId: `kundli_${Date.now()}`,
    ...enrichedChart,
    nakshatraAnalysis: copy.nakshatraAnalysis,
    lagnaAnalysis: copy.lagnaAnalysis,
    remedies: copy.remedies,
    personalityAnalysis: copy.personalityAnalysis,
    careerAnalysis: copy.careerAnalysis,
    marriageAnalysis: copy.marriageAnalysis,
    financeAnalysis: copy.financeAnalysis,
    healthAnalysis: copy.healthAnalysis,
    educationAnalysis: copy.educationAnalysis,
    aiSummary,
    disclaimer: copy.disclaimer,
    generatedAt: new Date().toISOString(),
    profile: { name: input.name, gender: input.gender },
    birthDetails: chart.birthDetails
  };
}

function kundliReportCopy(language: AstrologyBirthInput["language"], chart: BirthChartData) {
  if (language === "hi") {
    return {
      personalityAnalysis: `${translateSign(chart.avakhada.ascendant, "hi")} लग्न और ${translateSign(chart.avakhada.moonSign, "hi")} चंद्र राशि मिलकर स्वभाव, भावनात्मक जरूरतों और जीवन की प्राकृतिक लय को समझने में मदद करते हैं।`,
      nakshatraAnalysis: `${chart.avakhada.nakshatra} नक्षत्र समय, सहज भावनाओं और प्रतिक्रिया शैली को समझने का संकेत देता है। इसे स्थायी लेबल की तरह नहीं, बल्कि आत्मचिंतन के साधन की तरह देखें।`,
      lagnaAnalysis: `${translateSign(chart.avakhada.ascendant, "hi")} लग्न जीवन के प्रति पहली प्रतिक्रिया, निर्णय शैली और बाहरी व्यक्तित्व को दर्शाता है।`,
      careerAnalysis: "करियर में प्रगति तब बेहतर होती है जब व्यक्ति बिखरे अवसरों के बजाय केंद्रित प्रयास, अनुशासन और वर्तमान दशा/गोचर संकेतों का संतुलित उपयोग करता है।",
      marriageAnalysis: "विवाह और संबंधों के लिए सप्तम भाव, शुक्र, मंगल, चंद्र, दशा समय और अनुकूलता को साथ में देखकर संतुलित निष्कर्ष लेना चाहिए।",
      financeAnalysis: "वित्तीय स्पष्टता योजनाबद्ध प्रतिबद्धताओं, नियमित बचत और भावनात्मक खर्चों से बचने पर बढ़ती है।",
      healthAnalysis: "ज्योतिष को स्वास्थ्य के लिए केवल चिंतन संकेत की तरह लें। संतुलित दिनचर्या, विश्राम, जल सेवन और योग्य चिकित्सा सलाह महत्वपूर्ण हैं।",
      educationAnalysis: "शिक्षा और सीखने में संरचना, मार्गदर्शक सहयोग और नियमित अभ्यास अंतिम समय की जल्दबाजी से अधिक सहायक होते हैं।",
      remedies: ["नियमित ध्यान और प्रार्थना रखें।", "निर्णय भय से नहीं, स्पष्टता और धैर्य से लें।", "जरूरी विषयों पर योग्य ज्योतिषी से पूरी कुंडली के साथ सलाह लें।"],
      disclaimer: "Naksharix रिपोर्ट आत्मचिंतन और योजना के लिए हैं। ये चिकित्सा, कानूनी, वित्तीय या मानसिक स्वास्थ्य सलाह का विकल्प नहीं हैं।"
    };
  }
  if (language === "hinglish") {
    return {
      personalityAnalysis: `${translateSign(chart.avakhada.ascendant, "hinglish")} lagna aur ${translateSign(chart.avakhada.moonSign, "hinglish")} moon sign milkar nature, emotional needs aur natural rhythm ko samajhne me help karte hain.`,
      nakshatraAnalysis: `${chart.avakhada.nakshatra} nakshatra timing, instinct aur emotional response style ka reflective signal deta hai. Isse fixed label ki tarah nahi, self-reflection ke tool ki tarah dekhein.`,
      lagnaAnalysis: `${translateSign(chart.avakhada.ascendant, "hinglish")} lagna life approach, decision style aur first responses ko highlight karta hai.`,
      careerAnalysis: "Career progress tab better hoti hai jab native scattered opportunities ke bajay focused effort, discipline aur current dasha/transit themes ko balance ke saath use karta hai.",
      marriageAnalysis: "Relationship guidance ke liye seventh house, Venus, Mars, Moon, dasha timing aur compatibility context ko saath me dekhna zaroori hai.",
      financeAnalysis: "Financial clarity planned commitments, consistent savings aur emotionally reactive spending se bachne par improve hoti hai.",
      healthAnalysis: "Astrology ko wellness reflection signal ki tarah use karein. Balanced routine, rest, hydration aur qualified medical guidance important hain.",
      educationAnalysis: "Learning structure, mentor support aur practical repetition se improve hoti hai, last-minute intensity se nahi.",
      remedies: ["Regular dhyan aur prayer routine rakhein.", "Decisions fear se nahi, clarity aur patience se lein.", "Important matters ke liye qualified astrologer se full kundli ke saath consult karein."],
      disclaimer: "Naksharix reports reflection aur planning ke liye hain. Ye medical, legal, financial ya mental-health advice ka replacement nahi hain."
    };
  }
  return {
    personalityAnalysis: `${chart.avakhada.ascendant} ascendant and ${chart.avakhada.moonSign} moon sign together show the native's response style, emotional needs, and natural rhythm.`,
    nakshatraAnalysis: `${chart.avakhada.nakshatra} emphasizes instinct, timing, and emotional rhythm. Use it as a reflective lens, not a fixed label.`,
    lagnaAnalysis: `${chart.avakhada.ascendant} rising highlights the way the native approaches life, decisions, and first responses.`,
    careerAnalysis: "Career progress improves when the native chooses focused effort over scattered opportunities and uses current dasha/transit themes with discipline.",
    marriageAnalysis: "Relationship guidance should consider the seventh house, Venus, Mars, Moon, dasha timing, and compatibility context together.",
    financeAnalysis: "Financial clarity grows through planned commitments, consistent savings, and avoiding emotionally reactive spending.",
    healthAnalysis: "Use astrology as a reflective wellness signal only. Balanced routines, rest, hydration, and qualified medical guidance remain important.",
    educationAnalysis: "Learning improves through structure, mentor support, and practical repetition rather than last-minute intensity.",
    remedies: chart.remedies,
    disclaimer: "Naksharix reports are for reflection and planning. They do not replace medical, legal, financial, or mental-health advice."
  };
}

function translateSign(sign: string, language: "hi" | "hinglish") {
  const hi: Record<string, string> = { Aries: "मेष", Taurus: "वृषभ", Gemini: "मिथुन", Cancer: "कर्क", Leo: "सिंह", Virgo: "कन्या", Libra: "तुला", Scorpio: "वृश्चिक", Sagittarius: "धनु", Capricorn: "मकर", Aquarius: "कुंभ", Pisces: "मीन" };
  const hinglish: Record<string, string> = { Aries: "Mesh", Taurus: "Vrishabh", Gemini: "Mithun", Cancer: "Kark", Leo: "Singh", Virgo: "Kanya", Libra: "Tula", Scorpio: "Vrishchik", Sagittarius: "Dhanu", Capricorn: "Makar", Aquarius: "Kumbh", Pisces: "Meen" };
  return (language === "hi" ? hi : hinglish)[sign] ?? sign;
}
