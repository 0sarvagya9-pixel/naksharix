import { format } from "date-fns";
import type { Locale } from "@/lib/i18n";

export type NumerologyInput = {
  name: string;
  dateOfBirth: string | Date;
  gender?: string;
  mobile?: string;
  vehicle?: string;
  locale?: Locale;
};

export type NumerologyNumber = {
  label: string;
  value: number;
  meaning: string;
  strengths: string[];
  growthAreas: string[];
  guidance: string;
};

export type LoShuCell = {
  number: number;
  count: number;
  present: boolean;
  meaning: string;
};

export type NumerologyReport = {
  name: string;
  dateOfBirth: string;
  moolank: NumerologyNumber;
  lifePath: NumerologyNumber;
  destiny: NumerologyNumber;
  nameNumber: NumerologyNumber;
  soulUrge: NumerologyNumber;
  personality: NumerologyNumber;
  loShuGrid: LoShuCell[];
  missingNumbers: NumerologyNumber[];
  repeatedNumbers: Array<NumerologyNumber & { count: number }>;
  mobileAnalysis?: NumerologyNumber;
  vehicleAnalysis?: NumerologyNumber;
  dailyPrediction: {
    date: string;
    personalDayNumber: number;
    summary: string;
    focus: string[];
  };
  remedies: string[];
  disclaimer: string;
};

const masterNumbers = new Set([11, 22, 33]);
const loShuOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
const vowels = new Set(["A", "E", "I", "O", "U"]);

const copy = {
  en: {
    labels: {
      moolank: "Moolank / Birth Number",
      lifePath: "Bhagyank / Life Path Number",
      destiny: "Destiny Number",
      nameNumber: "Name Number / Naamank",
      soulUrge: "Soul Urge Number",
      personality: "Personality Number",
      mobile: "Mobile Number Analysis",
      vehicle: "Vehicle Number Analysis"
    },
    missing: "This number is missing in the Lo Shu grid, so its qualities need conscious cultivation.",
    repeated: "This number repeats in the Lo Shu grid, so its qualities become more visible in daily life.",
    daily: "Today's personal number supports focused action, clear priorities, and practical follow-through.",
    disclaimer: "Numerology is a reflective planning tool. It does not replace professional medical, legal, financial, or mental-health advice.",
    remedies: ["Keep one clear intention for the day.", "Use disciplined communication before major decisions.", "Practice gratitude, service, and steady routines."]
  },
  hi: {
    labels: {
      moolank: "मूलांक / जन्मांक",
      lifePath: "भाग्यांक / जीवन पथ अंक",
      destiny: "भाग्यांक",
      nameNumber: "नामांक",
      soulUrge: "आत्मिक ऊर्जा अंक",
      personality: "व्यक्तित्व अंक",
      mobile: "मोबाइल नंबर विश्लेषण",
      vehicle: "वाहन नंबर विश्लेषण"
    },
    missing: "यह अंक लो शू ग्रिड में अनुपस्थित है, इसलिए इसके गुणों को सचेत अभ्यास से विकसित करना उपयोगी रहेगा।",
    repeated: "यह अंक लो शू ग्रिड में दोहराता है, इसलिए इसके गुण दैनिक जीवन में अधिक स्पष्ट दिखते हैं।",
    daily: "आज का व्यक्तिगत अंक केंद्रित प्रयास, स्पष्ट प्राथमिकता और व्यावहारिक अनुशासन को सहारा देता है।",
    disclaimer: "अंक ज्योतिष आत्मचिंतन और योजना का साधन है। यह चिकित्सा, कानूनी, वित्तीय या मानसिक स्वास्थ्य सलाह का विकल्प नहीं है।",
    remedies: ["दिन के लिए एक स्पष्ट संकल्प रखें।", "बड़े निर्णय से पहले अनुशासित संवाद रखें।", "कृतज्ञता, सेवा और स्थिर दिनचर्या का अभ्यास करें।"]
  },
  hinglish: {
    labels: {
      moolank: "Moolank / Birth Number",
      lifePath: "Bhagyank / Life Path Number",
      destiny: "Destiny Number",
      nameNumber: "Naamank",
      soulUrge: "Soul Urge Number",
      personality: "Personality Number",
      mobile: "Mobile Number Analysis",
      vehicle: "Vehicle Number Analysis"
    },
    missing: "Ye number Lo Shu grid me missing hai, isliye iski qualities ko conscious practice se develop karna helpful rahega.",
    repeated: "Ye number Lo Shu grid me repeat hota hai, isliye iski qualities daily life me zyada visible hoti hain.",
    daily: "Aaj ka personal number focused action, clear priorities aur practical follow-through ko support karta hai.",
    disclaimer: "Numerology reflection aur planning tool hai. Yeh medical, legal, financial ya mental-health advice ka replacement nahi hai.",
    remedies: ["Din ke liye ek clear intention rakhein.", "Major decisions se pehle disciplined communication rakhein.", "Gratitude, seva aur steady routine practice karein."]
  }
} satisfies Record<Locale, {
  labels: Record<string, string>;
  missing: string;
  repeated: string;
  daily: string;
  disclaimer: string;
  remedies: string[];
}>;

const numberProfiles: Record<Locale, Record<number, Omit<NumerologyNumber, "label" | "value">>> = {
  en: {
    1: profile("Leadership, initiative, and self-direction.", ["confidence", "new beginnings"], ["impatience", "ego balance"], "Lead with clarity and listen before acting."),
    2: profile("Cooperation, sensitivity, and emotional intelligence.", ["diplomacy", "patience"], ["over-dependence", "hesitation"], "Use calm partnership and clear boundaries."),
    3: profile("Expression, creativity, and joyful communication.", ["creativity", "optimism"], ["scattered focus", "over-talking"], "Choose one idea and complete it beautifully."),
    4: profile("Structure, discipline, and practical stability.", ["planning", "reliability"], ["rigidity", "fear of change"], "Build slow systems instead of rushing outcomes."),
    5: profile("Freedom, movement, learning, and adaptability.", ["versatility", "travel energy"], ["restlessness", "inconsistency"], "Use flexibility with a written plan."),
    6: profile("Care, responsibility, beauty, and family harmony.", ["nurturing", "service"], ["over-responsibility", "control"], "Support others without carrying everything."),
    7: profile("Research, intuition, solitude, and inner wisdom.", ["analysis", "spiritual insight"], ["isolation", "overthinking"], "Balance reflection with grounded routines."),
    8: profile("Power, management, finance, and material discipline.", ["execution", "ambition"], ["pressure", "work imbalance"], "Use authority ethically and track resources."),
    9: profile("Compassion, completion, wisdom, and broad vision.", ["generosity", "maturity"], ["emotional heaviness", "attachment"], "Serve with boundaries and release old cycles."),
    11: profile("Intuition, inspiration, and heightened sensitivity.", ["vision", "spiritual awareness"], ["nervous intensity", "idealism"], "Ground inspiration through simple daily discipline."),
    22: profile("Master building, large vision, and practical manifestation.", ["scale", "organization"], ["pressure", "perfectionism"], "Turn big plans into measurable steps."),
    33: profile("Compassionate teaching, healing, and service.", ["guidance", "heart wisdom"], ["self-sacrifice", "emotional overload"], "Serve with care and strong personal boundaries.")
  },
  hi: {
    1: profile("नेतृत्व, पहल और आत्मनिर्भर दिशा।", ["आत्मविश्वास", "नई शुरुआत"], ["अधीरता", "अहं संतुलन"], "स्पष्टता से नेतृत्व करें और कार्य से पहले सुनें।"),
    2: profile("सहयोग, संवेदनशीलता और भावनात्मक समझ।", ["कूटनीति", "धैर्य"], ["अधिक निर्भरता", "हिचकिचाहट"], "शांत साझेदारी और स्पष्ट सीमाएं रखें।"),
    3: profile("अभिव्यक्ति, रचनात्मकता और आनंदपूर्ण संवाद।", ["रचनात्मकता", "आशावाद"], ["बिखरा ध्यान", "अधिक बोलना"], "एक विचार चुनकर उसे सुंदर ढंग से पूरा करें।"),
    4: profile("संरचना, अनुशासन और व्यावहारिक स्थिरता।", ["योजना", "विश्वसनीयता"], ["कठोरता", "बदलाव का भय"], "जल्दबाजी के बजाय स्थिर प्रणाली बनाएं।"),
    5: profile("स्वतंत्रता, गति, सीखना और अनुकूलन।", ["बहुमुखीपन", "यात्रा ऊर्जा"], ["बेचैनी", "अनियमितता"], "लचीलापन रखें, पर लिखित योजना के साथ।"),
    6: profile("देखभाल, जिम्मेदारी, सौंदर्य और परिवारिक सामंजस्य।", ["पालन-पोषण", "सेवा"], ["अधिक जिम्मेदारी", "नियंत्रण"], "सब कुछ अपने ऊपर लिए बिना सहयोग दें।"),
    7: profile("शोध, अंतर्ज्ञान, एकांत और आंतरिक ज्ञान।", ["विश्लेषण", "आध्यात्मिक दृष्टि"], ["अलगाव", "अधिक सोचना"], "चिंतन को grounded routine से संतुलित करें।"),
    8: profile("शक्ति, प्रबंधन, वित्त और भौतिक अनुशासन।", ["कार्यान्वयन", "महत्वाकांक्षा"], ["दबाव", "काम असंतुलन"], "अधिकार का नैतिक उपयोग करें और संसाधन ट्रैक करें।"),
    9: profile("करुणा, पूर्णता, ज्ञान और व्यापक दृष्टि।", ["उदारता", "परिपक्वता"], ["भावनात्मक भारीपन", "लगाव"], "सीमाओं के साथ सेवा करें और पुराने चक्र छोड़ें।"),
    11: profile("अंतर्ज्ञान, प्रेरणा और बढ़ी संवेदनशीलता।", ["दृष्टि", "आध्यात्मिक जागरूकता"], ["नर्वस तनाव", "अधिक आदर्शवाद"], "प्रेरणा को सरल दैनिक अनुशासन से जमीन दें।"),
    22: profile("बड़ी दृष्टि, निर्माण और व्यावहारिक अभिव्यक्ति।", ["विस्तार", "संगठन"], ["दबाव", "परफेक्शनिज्म"], "बड़ी योजना को मापने योग्य चरणों में बदलें।"),
    33: profile("करुणामय शिक्षण, healing और सेवा।", ["मार्गदर्शन", "हृदय ज्ञान"], ["आत्म-बलिदान", "भावनात्मक बोझ"], "मजबूत सीमाओं के साथ सेवा करें।")
  },
  hinglish: {
    1: profile("Leadership, initiative aur self-direction.", ["confidence", "new beginnings"], ["impatience", "ego balance"], "Clarity se lead karein aur action se pehle sunen."),
    2: profile("Cooperation, sensitivity aur emotional intelligence.", ["diplomacy", "patience"], ["over-dependence", "hesitation"], "Calm partnership aur clear boundaries use karein."),
    3: profile("Expression, creativity aur joyful communication.", ["creativity", "optimism"], ["scattered focus", "over-talking"], "Ek idea choose karke beautifully complete karein."),
    4: profile("Structure, discipline aur practical stability.", ["planning", "reliability"], ["rigidity", "change ka fear"], "Rush ke bajay slow systems banayein."),
    5: profile("Freedom, movement, learning aur adaptability.", ["versatility", "travel energy"], ["restlessness", "inconsistency"], "Flexibility ko written plan ke saath use karein."),
    6: profile("Care, responsibility, beauty aur family harmony.", ["nurturing", "service"], ["over-responsibility", "control"], "Sab kuch carry kiye bina support dein."),
    7: profile("Research, intuition, solitude aur inner wisdom.", ["analysis", "spiritual insight"], ["isolation", "overthinking"], "Reflection ko grounded routines se balance karein."),
    8: profile("Power, management, finance aur material discipline.", ["execution", "ambition"], ["pressure", "work imbalance"], "Authority ethically use karein aur resources track karein."),
    9: profile("Compassion, completion, wisdom aur broad vision.", ["generosity", "maturity"], ["emotional heaviness", "attachment"], "Boundaries ke saath serve karein aur old cycles release karein."),
    11: profile("Intuition, inspiration aur heightened sensitivity.", ["vision", "spiritual awareness"], ["nervous intensity", "idealism"], "Inspiration ko simple daily discipline se ground karein."),
    22: profile("Master building, large vision aur practical manifestation.", ["scale", "organization"], ["pressure", "perfectionism"], "Big plans ko measurable steps me badlein."),
    33: profile("Compassionate teaching, healing aur service.", ["guidance", "heart wisdom"], ["self-sacrifice", "emotional overload"], "Care aur strong personal boundaries ke saath serve karein.")
  }
};

function profile(meaning: string, strengths: string[], growthAreas: string[], guidance: string) {
  return { meaning, strengths, growthAreas, guidance };
}

export function calculateNumerologyReport(input: NumerologyInput): NumerologyReport {
  const locale = input.locale ?? "en";
  const dob = normalizeBirthDate(input.dateOfBirth);
  const name = input.name.trim();
  const digits = dateDigits(dob);
  const nameValues = nameNumerologyValues(name);
  const birthDay = dob.getDate();
  const day = new Date();
  const lifePath = reduceNumber(digits.reduce((sum, digit) => sum + digit, 0));
  const moolank = reduceNumber(birthDay);
  const destiny = reduceNumber(nameValues.total);
  const soulUrge = reduceNumber(nameValues.vowels || nameValues.total);
  const personality = reduceNumber(Math.max(1, nameValues.consonants || nameValues.total));
  const dateText = format(dob, "yyyy-MM-dd");
  const counts = loShuCounts(digits);
  const mobile = input.mobile ? reduceNumber(digitsFromString(input.mobile).reduce((sum, digit) => sum + digit, 0)) : undefined;
  const vehicle = input.vehicle ? reduceNumber(alphaNumericValue(input.vehicle)) : undefined;

  return {
    name,
    dateOfBirth: dateText,
    moolank: numberResult(copy[locale].labels.moolank, moolank, locale),
    lifePath: numberResult(copy[locale].labels.lifePath, lifePath, locale),
    destiny: numberResult(copy[locale].labels.destiny, destiny, locale),
    nameNumber: numberResult(copy[locale].labels.nameNumber, destiny, locale),
    soulUrge: numberResult(copy[locale].labels.soulUrge, soulUrge, locale),
    personality: numberResult(copy[locale].labels.personality, personality, locale),
    loShuGrid: loShuOrder.map((number) => ({
      number,
      count: counts[number] ?? 0,
      present: (counts[number] ?? 0) > 0,
      meaning: (counts[number] ?? 0) > 0 ? numberProfiles[locale][number].meaning : copy[locale].missing
    })),
    missingNumbers: loShuOrder.filter((number) => !counts[number]).map((number) => numberResult(String(number), number, locale, copy[locale].missing)),
    repeatedNumbers: loShuOrder.filter((number) => (counts[number] ?? 0) > 1).map((number) => ({ ...numberResult(String(number), number, locale, copy[locale].repeated), count: counts[number] })),
    mobileAnalysis: mobile ? numberResult(copy[locale].labels.mobile, mobile, locale) : undefined,
    vehicleAnalysis: vehicle ? numberResult(copy[locale].labels.vehicle, vehicle, locale) : undefined,
    dailyPrediction: {
      date: format(day, "yyyy-MM-dd"),
      personalDayNumber: reduceNumber(lifePath + day.getDate() + day.getMonth() + 1 + day.getFullYear()),
      summary: copy[locale].daily,
      focus: numberProfiles[locale][reduceNumber(lifePath + day.getDate())].strengths
    },
    remedies: copy[locale].remedies,
    disclaimer: copy[locale].disclaimer
  };
}

function numberResult(label: string, value: number, locale: Locale, overrideMeaning?: string): NumerologyNumber {
  const profile = numberProfiles[locale][value] ?? numberProfiles[locale][reduceNumber(value)];
  return {
    label,
    value,
    meaning: overrideMeaning ?? profile.meaning,
    strengths: profile.strengths,
    growthAreas: profile.growthAreas,
    guidance: profile.guidance
  };
}

function normalizeBirthDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date of birth");
  return date;
}

function dateDigits(date: Date) {
  return format(date, "ddMMyyyy").split("").map(Number).filter((digit) => Number.isFinite(digit));
}

function digitsFromString(value: string) {
  return value.replace(/\D/g, "").split("").map(Number).filter((digit) => Number.isFinite(digit));
}

function reduceNumber(value: number): number {
  if (masterNumbers.has(value)) return value;
  if (value <= 9) return Math.max(1, value);
  return reduceNumber(String(value).split("").reduce((sum, digit) => sum + Number(digit), 0));
}

function nameNumerologyValues(name: string) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
  let total = 0;
  let vowelTotal = 0;
  let consonantTotal = 0;
  for (const letter of letters) {
    const value = ((letter.charCodeAt(0) - 65) % 9) + 1;
    total += value;
    if (vowels.has(letter)) vowelTotal += value;
    else consonantTotal += value;
  }
  return { total: total || 1, vowels: vowelTotal, consonants: consonantTotal };
}

function loShuCounts(digits: number[]) {
  return digits.reduce<Record<number, number>>((acc, digit) => {
    if (digit >= 1 && digit <= 9) acc[digit] = (acc[digit] ?? 0) + 1;
    return acc;
  }, {});
}

function alphaNumericValue(value: string) {
  const letters = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return [...letters].reduce((sum, char) => {
    if (/\d/.test(char)) return sum + Number(char);
    return sum + ((char.charCodeAt(0) - 65) % 9) + 1;
  }, 0);
}
