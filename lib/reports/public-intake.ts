import type {Locale} from "@/lib/i18n";
import {reportRequestCopy} from "./report-request-copy";

// The public product disclosure, client intake and strict new-request validation
// use one report-specific scope. Historical envelopes remain supported.
export function reportIntakeScope(slug:string){
 const couple=slug==="couple-kundli",nameCorrection=slug==="name-correction-report",babyName=slug==="baby-name-report",dateNameOnly=nameCorrection||slug==="numerology-lo-shu-report",numerologyName=slug==="numerology-lo-shu-report"||slug==="fortune-report";
 return {dateNameOnly,couple,nameCorrection,babyName,numerologyName,romanName:nameCorrection||numerologyName,candidateNames:nameCorrection||babyName};
}
const basic={
 en:["Full name, birth date and birth time","Birth place and its resolved coordinates","Actual UTC offset at birth (including daylight saving where applicable)","Main question or concern (optional)","Confirm the birth details; delivery to the registered account"],
 hi:["पूरा नाम, जन्म तिथि और जन्म समय","जन्म स्थान और उसके सत्यापित निर्देशांक","जन्म के समय का वास्तविक UTC अंतर (जहाँ लागू हो, डेलाइट सेविंग सहित)","मुख्य प्रश्न या चिंता (वैकल्पिक)","जन्म विवरण की पुष्टि; पंजीकृत खाते में डिलीवरी"],
 hinglish:["Poora naam, birth date aur birth time","Birth place aur resolved coordinates","Janm ke samay actual UTC offset (jahaan lagu ho daylight saving ke saath)","Main question ya concern (optional)","Birth details confirm karein; registered account mein delivery"]
} as const;
const partner={
 en:["Second person's full name, date, time, place, coordinates and birth-time UTC offset","Permission to submit the other person's birth details"],
 hi:["दूसरे व्यक्ति का पूरा नाम, जन्म तिथि, समय, स्थान, निर्देशांक और जन्म-समय का UTC अंतर","दूसरे व्यक्ति का जन्म विवरण साझा करने की अनुमति"],
 hinglish:["Doosre vyakti ka poora naam, date, time, place, coordinates aur birth-time UTC offset","Doosre vyakti ki birth details share karne ki permission"]
} as const;
export function publicReportRequiredDetails(slug:string,locale:Locale):string[]{
 const scope=reportIntakeScope(slug),copy=reportRequestCopy[locale],list:string[]=scope.dateNameOnly?[copy.dateNameDetails,copy.dateNameConsent]:[...basic[locale]];
 if(scope.couple)list.push(...partner[locale]);
 if(scope.numerologyName)list.push(copy.romanFullName);
 if(scope.nameCorrection)list.push(copy.romanCurrent,copy.alternatives);
 if(scope.babyName)list.push(copy.preferredNames);
 return list;
}
export const reportSurfaceCopy={
 en:{eyebrow:"CURATED DIGITAL REPORTS",intro:"Explore personal insights",priceNote:"Clear report formats and the actual published prices for your account.",how:"How reports work",sample:"View fictional sample PDF",sampleLanguage:"English",sampleNote:"Selected pages from the actual report format. Fictional demonstration, not a customer report.",sampleDescription:"Preview the structure and page layout using fictional birth details. The complete purchased report includes the sections listed above.",buying:"Before you buy",buyingDescription:"Review what is included, how to receive your report and the applicable refund policy before paying. Your personal results are private.",deliveryGuide:"Report delivery guide",refund:"Refund policy",compare:"Compare all reports",guidance:"Report buying guidance",track:"Track your report in your account and download the private PDF."},
 hi:{eyebrow:"चयनित डिजिटल रिपोर्ट",intro:"व्यक्तिगत रिपोर्ट देखें",priceNote:"स्पष्ट रिपोर्ट प्रारूप और आपके खाते के लिए प्रकाशित वास्तविक कीमतें।",how:"रिपोर्ट कैसे मिलती हैं",sample:"काल्पनिक नमूना PDF देखें",sampleLanguage:"अंग्रेज़ी",sampleNote:"वास्तविक रिपोर्ट प्रारूप के चुनिंदा पृष्ठ। इसमें किसी ग्राहक का डेटा नहीं है।",sampleDescription:"काल्पनिक जन्म विवरण से रिपोर्ट की संरचना और पृष्ठों का प्रारूप देखें। पूरी सशुल्क रिपोर्ट में ऊपर सूचीबद्ध भाग शामिल हैं।",buying:"खरीदने से पहले",buyingDescription:"भुगतान से पहले शामिल भाग, रिपोर्ट प्राप्त करने का तरीका और लागू धनवापसी नीति देखें। आपकी व्यक्तिगत रिपोर्ट निजी है।",deliveryGuide:"रिपोर्ट डिलीवरी मार्गदर्शिका",refund:"धनवापसी नीति",compare:"सभी रिपोर्ट की तुलना करें",guidance:"रिपोर्ट खरीद मार्गदर्शन",track:"रिपोर्ट की स्थिति अपने खाते में देखें और निजी PDF डाउनलोड करें।"},
 hinglish:{eyebrow:"CURATED DIGITAL REPORTS",intro:"Personal insights explore karein",priceNote:"Report formats aur account ke liye actual published prices dekhein.",how:"Reports kaise milti hain",sample:"Fictional sample PDF dekhein",sampleLanguage:"English",sampleNote:"Actual report format ke selected pages. Yeh fictional demo hai, customer report nahi.",sampleDescription:"Fictional birth details se report structure aur page layout dekhein. Complete paid report mein upar listed sections milte hain.",buying:"Kharidne se pehle",buyingDescription:"Pay karne se pehle included sections, report delivery aur applicable refund policy dekhein. Aapki personal report private hai.",deliveryGuide:"Report delivery guide",refund:"Refund policy",compare:"Sabhi reports compare karein",guidance:"Report purchase guidance",track:"Account mein report status dekhein aur private PDF download karein."}
} as const satisfies Record<Locale,Record<string,string>>;
