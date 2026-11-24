/** Public brand facts shared by the English and Hindi discovery pages. */
export const brandName = "Naksharix";
export const brandDescription = "Naksharix is an online Vedic astrology platform offering free Kundli tools, traditional compatibility calculations, Panchang, horoscope, numerology and tarot reflection, along with optional personalized digital reports.";
export const hindiBrandDescription = "Naksharix एक ऑनलाइन वैदिक ज्योतिष मंच है। यहाँ निःशुल्क जन्म कुंडली, गुण मिलान, पंचांग, राशिफल, अंक ज्योतिष और टैरो से जुड़ी जानकारी तथा वैकल्पिक व्यक्तिगत डिजिटल रिपोर्ट उपलब्ध हैं।";

export const brandAnswers = {
  en: [
    { question: "What is the difference between Naksharix and Nakshatra?", answer: "Naksharix is the name of this online platform. Nakshatra is a term for a lunar mansion in the traditional Indian astrology system; it is one of the subjects covered by the platform." },
    { question: "Which tools can I use for free?", answer: "Start with the free birth chart, compatibility guide, Panchang and numerology calculators. Optional paid reports have their own product details, eligibility and price; an account may be required to save results or purchase a report." },
    { question: "How do personalized reports work?", answer: "Choose an available report, review its listed fee, contents and delivery information, and use the secure checkout if offered. Enter the birth information required for that report. Paid access depends on server-side payment verification; check the signed-in account for the actual report and delivery status." },
    { question: "Does Naksharix guarantee predictions?", answer: "No. These are traditional calculations and interpretive tools for personal reflection, not scientifically established predictions or substitutes for qualified medical, legal, financial or mental-health advice." },
    { question: "Which website is official?", answer: "The official website is www.naksharix.com. Use the Contact, Privacy Policy, Refund Policy and Delivery Policy links on that website for the applicable service and support information." }
  ],
  hi: [
    { question: "Naksharix और नक्षत्र में क्या अंतर है?", answer: "Naksharix इस ऑनलाइन मंच का नाम है। नक्षत्र पारंपरिक भारतीय ज्योतिष में चंद्रमा के आकाशीय पथ के एक भाग को कहते हैं। यह इस मंच पर समझाए जाने वाले विषयों में से एक है।" },
    { question: "कौन से टूल निःशुल्क हैं?", answer: "आप निःशुल्क जन्म कुंडली, गुण मिलान की जानकारी, पंचांग और अंक ज्योतिष के कैलकुलेटर से शुरुआत कर सकते हैं। वैकल्पिक सशुल्क रिपोर्ट का विवरण, पात्रता और शुल्क अलग से दिया जाता है। परिणाम सहेजने या रिपोर्ट खरीदने के लिए खाते की आवश्यकता हो सकती है।" },
    { question: "व्यक्तिगत डिजिटल रिपोर्ट कैसे मिलती है?", answer: "उपलब्ध रिपोर्ट चुनें, उसके शुल्क, विषय और डिलीवरी की जानकारी पढ़ें तथा उपलब्ध होने पर सुरक्षित भुगतान प्रक्रिया अपनाएँ। रिपोर्ट के लिए आवश्यक जन्म विवरण दें। सशुल्क सुविधा भुगतान की सर्वर पर पुष्टि के बाद मिलती है। वास्तविक रिपोर्ट और डिलीवरी की स्थिति अपने खाते में देखें।" },
    { question: "क्या Naksharix भविष्य की गारंटी देता है?", answer: "नहीं। ये व्यक्तिगत चिंतन के लिए पारंपरिक गणनाएँ और व्याख्याएँ हैं, वैज्ञानिक रूप से सिद्ध भविष्यवाणियाँ नहीं। चिकित्सा, कानूनी, वित्तीय या मानसिक स्वास्थ्य से जुड़े महत्वपूर्ण निर्णयों के लिए योग्य विशेषज्ञ की सलाह लें।" },
    { question: "Naksharix की आधिकारिक वेबसाइट कौन सी है?", answer: "आधिकारिक वेबसाइट www.naksharix.com है। सेवा और सहायता की जानकारी के लिए इसी वेबसाइट पर संपर्क, गोपनीयता, वापसी और डिलीवरी की नीतियाँ देखें।" }
  ]
} as const;

export const brandToolLinks = [
  { en: "Free Kundli", hi: "निःशुल्क जन्म कुंडली", english: "/free-kundli", hindi: "/hi/free-kundli" },
  { en: "Kundli matching", hi: "कुंडली मिलान", english: "/kundli-matching", hindi: "/hi/kundli-milan" },
  { en: "Panchang", hi: "पंचांग", english: "/panchang", hindi: "/panchang" },
  { en: "Lo Shu grid calculator", hi: "लो शू ग्रिड कैलकुलेटर", english: "/free-calculators/lo-shu-grid-calculator", hindi: "/free-calculators/lo-shu-grid-calculator" },
  { en: "Digital reports", hi: "डिजिटल रिपोर्ट", english: "/reports", hindi: "/reports" },
  { en: "Report delivery guide", hi: "रिपोर्ट डिलीवरी की जानकारी", english: "/blog/personalized-astrology-report-delivery-guide", hindi: "/blog/personalized-astrology-report-delivery-guide" },
  { en: "Privacy policy", hi: "गोपनीयता नीति", english: "/privacy-policy", hindi: "/privacy-policy" },
  { en: "Contact support", hi: "संपर्क और सहायता", english: "/contact", hindi: "/contact" }
] as const;
