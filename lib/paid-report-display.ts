import type { Locale } from "@/lib/i18n";
import { paidReports } from "@/lib/paid-reports";

type PaidReport = (typeof paidReports)[number];

const reportCopy = {
  en: {
    "kundli-pro": {
      name: "Kundli Report",
      description: "Detailed birth chart, planetary positions, lagna, navamsa, dasha insights, yog analysis, dosha review, and remedial guidance.",
      features: ["Birth details and chart summary", "Planets, houses, lagna and navamsa", "Dasha, yogas, doshas and remedies", "Download-ready PDF template"]
    },
    "career-report": {
      name: "Career Report",
      description: "Career strengths, work timing, leadership style, professional risks, and practical growth recommendations.",
      features: ["Career house analysis", "Planet strength for work", "Growth windows", "Practical upskilling remedies"]
    },
    "marriage-report": {
      name: "Marriage Report",
      description: "Marriage timing themes, compatibility factors, emotional patterns, Manglik context, and relationship remedies.",
      features: ["Relationship house review", "Marriage timing themes", "Manglik and dosha context", "Practical harmony remedies"]
    },
    "finance-report": {
      name: "Finance Report",
      description: "Wealth patterns, risk temperament, savings discipline, earning windows, and grounded money guidance.",
      features: ["Wealth house summary", "Income and expense themes", "Risk and discipline notes", "Money ritual plan"]
    },
    "health-report": {
      name: "Health Astrology Report",
      description: "Wellness tendencies, stress rhythms, daily routine suggestions, and ethical non-medical astrology guidance.",
      features: ["Wellness pattern overview", "Stress and recovery themes", "Routine recommendations", "Gentle spiritual remedies"]
    },
    "yearly-ai": {
      name: "Yearly Prediction Report 2026",
      description: "A personalized annual astrology report combining horoscope patterns, numerology, transits, and AI synthesis.",
      features: ["Month-by-month forecast", "Love, career, health and finance", "AI-generated remedies", "Lucky dates and colors"]
    },
    "numerology-report": {
      name: "Numerology Report",
      description: "Life path, destiny, soul urge, personality number, name vibration, and daily numerology recommendations.",
      features: ["Life path and destiny number", "Soul urge and personality number", "Name correction guidance", "Daily numerology habits"]
    }
  },
  hi: {
    "kundli-pro": {
      name: "कुंडली रिपोर्ट",
      description: "जन्म कुंडली, ग्रह स्थिति, लग्न, नवांश, दशा, योग, दोष और उपायों की विस्तृत रिपोर्ट।",
      features: ["जन्म विवरण और चार्ट सारांश", "ग्रह, भाव, लग्न और नवांश", "दशा, योग, दोष और उपाय", "डाउनलोड के लिए तैयार PDF टेम्पलेट"]
    },
    "career-report": {
      name: "करियर रिपोर्ट",
      description: "करियर क्षमता, कार्य समय, नेतृत्व शैली, पेशेवर जोखिम और व्यावहारिक विकास सुझाव।",
      features: ["करियर भाव विश्लेषण", "काम के लिए ग्रह बल", "विकास के अवसर", "व्यावहारिक उन्नति उपाय"]
    },
    "marriage-report": {
      name: "विवाह रिपोर्ट",
      description: "विवाह समय संकेत, अनुकूलता, भावनात्मक पैटर्न, मांगलिक संदर्भ और संबंध उपाय।",
      features: ["संबंध भाव समीक्षा", "विवाह समय संकेत", "मांगलिक और दोष संदर्भ", "व्यावहारिक सामंजस्य उपाय"]
    },
    "finance-report": {
      name: "वित्त रिपोर्ट",
      description: "धन पैटर्न, जोखिम स्वभाव, बचत अनुशासन, आय के समय और व्यावहारिक धन मार्गदर्शन।",
      features: ["धन भाव सारांश", "आय और खर्च संकेत", "जोखिम और अनुशासन नोट्स", "धन साधना योजना"]
    },
    "health-report": {
      name: "स्वास्थ्य ज्योतिष रिपोर्ट",
      description: "स्वास्थ्य प्रवृत्ति, तनाव लय, दैनिक दिनचर्या सुझाव और नैतिक गैर-चिकित्सीय ज्योतिष मार्गदर्शन।",
      features: ["स्वास्थ्य पैटर्न अवलोकन", "तनाव और रिकवरी संकेत", "दिनचर्या सुझाव", "सरल आध्यात्मिक उपाय"]
    },
    "yearly-ai": {
      name: "वार्षिक भविष्यवाणी रिपोर्ट 2026",
      description: "राशिफल पैटर्न, अंक ज्योतिष, गोचर और AI सार के साथ व्यक्तिगत वार्षिक रिपोर्ट।",
      features: ["मासिक भविष्यवाणी", "प्रेम, करियर, स्वास्थ्य और वित्त", "AI-जनित उपाय", "शुभ तिथियां और रंग"]
    },
    "numerology-report": {
      name: "अंक ज्योतिष रिपोर्ट",
      description: "जीवन पथ, भाग्य, आत्मिक ऊर्जा, व्यक्तित्व अंक, नाम ऊर्जा और दैनिक अंक ज्योतिष सुझाव।",
      features: ["जीवन पथ और भाग्य अंक", "आत्मिक ऊर्जा और व्यक्तित्व अंक", "नाम सुधार मार्गदर्शन", "दैनिक अंक ज्योतिष आदतें"]
    }
  },
  hinglish: {
    "kundli-pro": {
      name: "Kundli Report",
      description: "Birth chart, grah positions, lagna, navamsa, dasha insights, yog, dosh aur remedies ki detailed report.",
      features: ["Birth details aur chart summary", "Planets, houses, lagna aur navamsa", "Dasha, yogas, doshas aur remedies", "Download-ready PDF template"]
    },
    "career-report": {
      name: "Career Report",
      description: "Career strengths, work timing, leadership style, professional risks aur practical growth recommendations.",
      features: ["Career house analysis", "Work ke liye planet strength", "Growth windows", "Practical upskilling remedies"]
    },
    "marriage-report": {
      name: "Vivah Report",
      description: "Vivah timing themes, compatibility factors, emotional patterns, Manglik context aur relationship remedies.",
      features: ["Relationship house review", "Vivah timing themes", "Manglik aur dosha context", "Practical harmony remedies"]
    },
    "finance-report": {
      name: "Finance Report",
      description: "Wealth patterns, risk temperament, savings discipline, earning windows aur grounded money guidance.",
      features: ["Wealth house summary", "Income aur expense themes", "Risk aur discipline notes", "Money ritual plan"]
    },
    "health-report": {
      name: "Health Astrology Report",
      description: "Wellness tendencies, stress rhythms, daily routine suggestions aur ethical non-medical astrology guidance.",
      features: ["Wellness pattern overview", "Stress aur recovery themes", "Routine recommendations", "Gentle spiritual remedies"]
    },
    "yearly-ai": {
      name: "Yearly Prediction Report 2026",
      description: "Horoscope patterns, numerology, transits aur AI synthesis ke saath personalized annual astrology report.",
      features: ["Month-by-month forecast", "Love, career, health aur finance", "AI-generated remedies", "Lucky dates aur colors"]
    },
    "numerology-report": {
      name: "Numerology Report",
      description: "Life path, destiny, soul urge, personality number, name vibration aur daily numerology recommendations.",
      features: ["Life path aur destiny number", "Soul urge aur personality number", "Name correction guidance", "Daily numerology habits"]
    }
  }
} as const;

export function localizePaidReport(report: PaidReport, locale: Locale) {
  return reportCopy[locale][report.id] ?? reportCopy.en[report.id];
}

const detailItems = {
  en: Object.fromEntries(paidReports.map((report) => [report.id, { sample: [...report.sample], faqs: [...report.faqs] }])) as Record<PaidReport["id"], { sample: string[]; faqs: string[] }>,
  hi: {
    "kundli-pro": {
      sample: ["लग्न स्वभाव अवलोकन", "मजबूत और कमजोर ग्रह नोट्स", "अगले 30 दिनों के लिए उपाय योजना"],
      faqs: ["क्या इसमें मांगलिक विश्लेषण शामिल है?", "क्या इसे करियर और विवाह समय के लिए उपयोग कर सकता/सकती हूं?", "क्या रिपोर्ट डाउनलोड हो सकती है?"]
    },
    "career-report": {
      sample: ["उपयुक्त कार्य विषय", "भूमिका बदलाव का समय", "संवाद और नेतृत्व नोट्स"],
      faqs: ["क्या यह सटीक नौकरी बताता है?", "क्या इसमें व्यवसाय मार्गदर्शन है?", "क्या यह उपाय सुझाएगा?"]
    },
    "marriage-report": {
      sample: ["संवाद पैटर्न", "परिवार सामंजस्य नोट्स", "अनुशंसित चर्चा चेकलिस्ट"],
      faqs: ["क्या यह कुंडली मिलान जैसा है?", "क्या यह समय में मदद करेगा?", "क्या इसमें उपाय शामिल हैं?"]
    },
    "finance-report": {
      sample: ["वित्तीय आदत निदान", "अनुकूल योजना समय", "खर्च सावधानी अवधि"],
      faqs: ["क्या यह वित्तीय सलाह है?", "क्या यह प्लानर की जगह ले सकता है?", "क्या इसमें शुभ तिथियां हैं?"]
    },
    "health-report": {
      sample: ["नींद और दिनचर्या फोकस", "ऊर्जा प्रबंधन नोट", "मन-शरीर आदत सुझाव"],
      faqs: ["क्या यह चिकित्सा सलाह है?", "क्या डॉक्टर से मिलना चाहिए?", "क्या इसमें जीवनशैली सुझाव हैं?"]
    },
    "yearly-ai": {
      sample: ["त्रैमासिक थीम", "महत्वपूर्ण निर्णय महीने", "वार्षिक उपाय योजना"],
      faqs: ["क्या यह व्यक्तिगत है?", "क्या यह सभी महीनों को कवर करता है?", "क्या बाद में दोबारा बना सकता/सकती हूं?"]
    },
    "numerology-report": {
      sample: ["मुख्य अंक मैट्रिक्स", "नाम ऊर्जा नोट्स", "लकी नंबर दिनचर्या"],
      faqs: ["क्या व्यवसाय नाम विश्लेषण कर सकता/सकती हूं?", "क्या इसमें मोबाइल नंबर शामिल हैं?", "क्या यह स्पेलिंग बदलाव सुझा सकता है?"]
    }
  },
  hinglish: {
    "kundli-pro": {
      sample: ["Ascendant temperament overview", "Strong aur weak planet notes", "Next 30 days ke liye remedy plan"],
      faqs: ["Kya isme Manglik analysis hai?", "Kya career aur marriage timing ke liye use kar sakta/sakti hoon?", "Kya report downloadable hai?"]
    },
    "career-report": {
      sample: ["Best-fit work themes", "Role change ka timing", "Communication aur leadership notes"],
      faqs: ["Kya ye exact job predict karta hai?", "Kya business guidance include hai?", "Kya remedies suggest karega?"]
    },
    "marriage-report": {
      sample: ["Communication pattern", "Family alignment notes", "Recommended discussion checklist"],
      faqs: ["Kya ye kundli matching jaisa hai?", "Kya timing me help karega?", "Kya remedies include hain?"]
    },
    "finance-report": {
      sample: ["Financial habit diagnosis", "Favorable planning windows", "Spending caution periods"],
      faqs: ["Kya ye financial advice hai?", "Kya ye planner replace kar sakta hai?", "Kya lucky dates include hain?"]
    },
    "health-report": {
      sample: ["Sleep aur routine focus", "Energy management note", "Mind-body habit suggestions"],
      faqs: ["Kya ye medical advice hai?", "Kya doctor se milna chahiye?", "Kya lifestyle tips include hain?"]
    },
    "yearly-ai": {
      sample: ["Quarterly themes", "Important decision months", "Yearly remedy plan"],
      faqs: ["Kya ye personalized hai?", "Kya ye all months cover karta hai?", "Kya baad me regenerate kar sakte hain?"]
    },
    "numerology-report": {
      sample: ["Core number matrix", "Name vibration notes", "Lucky number routine"],
      faqs: ["Kya business name analyze kar sakta/sakti hoon?", "Kya mobile numbers include hain?", "Kya spelling changes suggest kar sakta hai?"]
    }
  }
} as const;

export function localizePaidReportDetailItems(report: PaidReport, locale: Locale) {
  return detailItems[locale][report.id] ?? detailItems.en[report.id];
}
