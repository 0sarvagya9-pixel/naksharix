/** Source-reviewed education, not a booking or prediction engine. */
export const SEASONAL_REVIEW_DATE = "2026-11-24";
export const seasonalSources = {
  "kumbhCalendar": "https://simhasthamahakumbh.maharashtra.gov.in/snan-calendar",
  "kumbhSchedule": "https://simhasthamahakumbh.maharashtra.gov.in/live-event-schedule",
  "kumbhSafety": "https://simhasthamahakumbh.maharashtra.gov.in/safety-guidelines",
  "kumbhFaq": "https://simhasthamahakumbh.maharashtra.gov.in/faqs",
  "december2026": "https://www.drikpanchang.com/festivals/month/festivals-december.html?lang=en&year=2026",
  "hindu2027": "https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?lang=en&year=2027",
  "eclipses": "https://eclipse.gsfc.nasa.gov/OH/OH2027.html",
  "indiaSolar": "https://www.timeanddate.com/eclipse/in/india?iso=20270802",
  "indiaLunar": "https://www.timeanddate.com/eclipse/in/india?iso=20270220",
  "solarSafety": "https://science.nasa.gov/eclipses/safety/"
} as const;
export const festivalHindi: Readonly<Record<string,string>> = {
  "Karwa Chauth": "करवा चौथ",
  "Dhanteras": "धनतेरस",
  "Lakshmi Puja / Diwali": "लक्ष्मी पूजा / दीपावली",
  "Govardhan Puja": "गोवर्धन पूजा",
  "Bhai Dooj": "भाई दूज",
  "Chhath Puja": "छठ पूजा",
  "Kartik Purnima": "कार्तिक पूर्णिमा",
  "Makar Sankranti / Surya Puja": "मकर संक्रांति / सूर्य पूजा",
  "Vasant Panchami / Saraswati Puja": "वसंत पंचमी / सरस्वती पूजा",
  "Maha Shivaratri / Shiva Puja": "महाशिवरात्रि / शिव पूजा",
  "Holika Dahan": "होलिका दहन",
  "Holi": "होली",
  "Chaitra Navratri": "चैत्र नवरात्रि",
  "Gudi Padwa / Ugadi": "गुड़ी पड़वा / उगादि",
  "Ram Navami Puja": "राम नवमी",
  "Hanuman Jayanti": "हनुमान जयंती",
  "Akshaya Tritiya": "अक्षय तृतीया",
  "Buddha Purnima": "बुद्ध पूर्णिमा",
  "Jagannath Rath Yatra": "जगन्नाथ रथ यात्रा",
  "Guru Purnima Puja": "गुरु पूर्णिमा",
  "Raksha Bandhan": "रक्षा बंधन",
  "Krishna Janmashtami Puja": "कृष्ण जन्माष्टमी",
  "Ganesh Chaturthi Puja": "गणेश चतुर्थी",
  "Sharad Navratri": "शारदीय नवरात्रि",
  "Durga Ashtami Puja": "दुर्गा अष्टमी",
  "Maha Navami Puja": "महानवमी",
  "Dussehra / Vijayadashami": "दशहरा / विजयादशमी",
  "Ram Navami Puja (Smarta)": "राम नवमी (स्मार्त)",
  "Kalabhairav Jayanti": "कालभैरव जयंती",
  "Utpanna Ekadashi": "उत्पन्ना एकादशी",
  "Ravi Pradosh Vrat": "रवि प्रदोष व्रत",
  "Masik Shivaratri": "मासिक शिवरात्रि",
  "Margashirsha Amavasya": "मार्गशीर्ष अमावस्या",
  "Vivah Panchami": "विवाह पंचमी",
  "Dhanu Sankranti": "धनु संक्रांति",
  "Gita Jayanti / Mokshada Ekadashi": "गीता जयंती / मोक्षदा एकादशी",
  "Dattatreya Jayanti / Margashirsha Purnima": "दत्तात्रेय जयंती / मार्गशीर्ष पूर्णिमा",
  "Saphala Ekadashi": "सफला एकादशी",
  "Pausha Putrada Ekadashi": "पौष पुत्रदा एकादशी",
  "Pausha Purnima": "पौष पूर्णिमा",
  "Sakat Chauth": "सकट चौथ",
  "Shattila Ekadashi": "षटतिला एकादशी",
  "Mauni Amavasya": "मौनी अमावस्या",
  "Ratha Saptami": "रथ सप्तमी",
  "Jaya Ekadashi": "जया एकादशी",
  "Magha Purnima": "माघ पूर्णिमा",
  "Vijaya Ekadashi": "विजया एकादशी",
  "Amalaki Ekadashi": "आमलकी एकादशी",
  "Shani Jayanti / Vat Savitri": "शनि जयंती / वट सावित्री",
  "Ganga Dussehra": "गंगा दशहरा",
  "Nirjala Ekadashi": "निर्जला एकादशी",
  "Devutthana Ekadashi": "देवउठनी एकादशी",
  "Tulsi Vivah": "तुलसी विवाह"
};
export const kumbhGuideDates = [
  {
    "date": "2026-10-31",
    "en": "Flag hoisting — Simhastha begins",
    "hi": "ध्वजारोहण — सिंहस्थ का प्रारंभ",
    "placeEn": "Nashik–Trimbakeshwar",
    "placeHi": "नाशिक–त्र्यंबकेश्वर"
  },
  {
    "date": "2027-06-15",
    "en": "Main Mela begins",
    "hi": "मुख्य मेला अवधि प्रारंभ",
    "placeEn": "Nashik–Trimbakeshwar",
    "placeHi": "नाशिक–त्र्यंबकेश्वर"
  },
  {
    "date": "2027-07-29",
    "en": "Nagar Pradakshina",
    "hi": "नगर प्रदक्षिणा",
    "placeEn": "Nashik",
    "placeHi": "नाशिक"
  },
  {
    "date": "2027-08-02",
    "en": "First Amrut Snan",
    "hi": "प्रथम अमृत स्नान",
    "placeEn": "Nashik–Trimbakeshwar",
    "placeHi": "नाशिक–त्र्यंबकेश्वर"
  },
  {
    "date": "2027-08-31",
    "en": "Second Amrut Snan",
    "hi": "द्वितीय अमृत स्नान",
    "placeEn": "Nashik–Trimbakeshwar",
    "placeHi": "नाशिक–त्र्यंबकेश्वर"
  },
  {
    "date": "2027-09-11",
    "en": "Third Amrut Snan — Nashik",
    "hi": "तृतीय अमृत स्नान — नाशिक",
    "placeEn": "Ramtirth",
    "placeHi": "रामतीर्थ"
  },
  {
    "date": "2027-09-12",
    "en": "Third Amrut Snan — Trimbakeshwar",
    "hi": "तृतीय अमृत स्नान — त्र्यंबकेश्वर",
    "placeEn": "Kushavarta Tirth",
    "placeHi": "कुशावर्त तीर्थ"
  },
  {
    "date": "2027-09-30",
    "en": "Main Mela period ends",
    "hi": "मुख्य मेला अवधि समाप्त",
    "placeEn": "Nashik–Trimbakeshwar",
    "placeHi": "नाशिक–त्र्यंबकेश्वर"
  },
  {
    "date": "2028-07-24",
    "en": "Flag lowering — Simhastha concludes",
    "hi": "ध्वजावतरण — सिंहस्थ का समापन",
    "placeEn": "Nashik–Trimbakeshwar",
    "placeHi": "नाशिक–त्र्यंबकेश्वर"
  }
] as const;
export const indiaEclipseDates = [{date:"2027-02-21",en:"Penumbral lunar eclipse",hi:"उपच्छाया चंद्र ग्रहण",source:seasonalSources.indiaLunar},{date:"2027-08-02",en:"Partial solar eclipse in India",hi:"भारत में आंशिक सूर्य ग्रहण",source:seasonalSources.indiaSolar}] as const;
export const seasonalPaths = {kumbh:{en:"/kumbh-mela-2027",hi:"/hi/kumbh-mela-2027"},festivals:{en:"/festival-calendar",hi:"/hi/festival-calendar"},eclipses:{en:"/grahan-2027",hi:"/hi/grahan-2027"}} as const;
