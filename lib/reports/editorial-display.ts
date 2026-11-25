/** Presentation-only vocabulary. Never translate names, addresses, questions,
 * numbers or arbitrary input through this dictionary. Unknown terms survive.
 * English output remains unchanged; Hindi/Hinglish use reviewed field labels.
 */
export type EditorialLocale="en"|"hi"|"hinglish";
const TERMS:Record<string,readonly [string,string]>={
 "Graha": [
  "ग्रह",
  "Graha"
 ],
 "Sign": [
  "राशि",
  "Rashi"
 ],
 "Degree": [
  "अंश",
  "Degree"
 ],
 "House": [
  "भाव",
  "Bhav"
 ],
 "Graha / sign": [
  "ग्रह / राशि",
  "Graha / Rashi"
 ],
 "Mahadasha": [
  "महादशा",
  "Mahadasha"
 ],
 "From": [
  "से",
  "Se"
 ],
 "To": [
  "तक",
  "Tak"
 ],
 "Koot": [
  "कूट",
  "Koot"
 ],
 "Score": [
  "अंक",
  "Score"
 ],
 "Traditional rule": [
  "पारंपरिक नियम",
  "Traditional niyam"
 ],
 "Repeated digit": [
  "दोहराया अंक",
  "Repeated ank"
 ],
 "Count": [
  "संख्या",
  "Ginti"
 ],
 "Reflection": [
  "चिंतन",
  "Reflection"
 ],
 "Not present": [
  "अनुपस्थित",
  "Maujood nahi"
 ],
 "Reflection themes": [
  "चिंतन विषय",
  "Reflection themes"
 ],
 "Name": [
  "नाम",
  "Naam"
 ],
 "Name number": [
  "नाम अंक",
  "Naamank"
 ],
 "Traditional sound": [
  "पारंपरिक ध्वनि",
  "Traditional dhwani"
 ],
 "Soul / personality": [
  "आत्मभाव / व्यक्तित्व",
  "Soul / personality"
 ],
 "Meaning / guidance": [
  "अर्थ / मार्गदर्शन",
  "Meaning / guidance"
 ],
 "Number": [
  "अंक",
  "Ank"
 ],
 "Lagna": [
  "लग्न",
  "Lagna"
 ],
 "Moon sign": [
  "चंद्र राशि",
  "Chandra rashi"
 ],
 "Sun sign": [
  "सूर्य राशि",
  "Surya rashi"
 ],
 "Nakshatra": [
  "नक्षत्र",
  "Nakshatra"
 ],
 "Pada": [
  "चरण",
  "Pada"
 ],
 "Moolank": [
  "मूलांक",
  "Moolank"
 ],
 "Bhagyank": [
  "भाग्यांक",
  "Bhagyank"
 ],
 "Naamank": [
  "नामांक",
  "Naamank"
 ],
 "Guna Milan": [
  "गुण मिलान",
  "Guna Milan"
 ],
 "Natal Moon": [
  "जन्म चंद्र",
  "Natal Chandra"
 ],
 "Natal Saturn": [
  "जन्म शनि",
  "Natal Shani"
 ],
 "Birth number": [
  "मूलांक",
  "Birth number"
 ],
 "Life path": [
  "भाग्यांक",
  "Life path"
 ],
 "Manglik": [
  "मांगलिक",
  "Manglik"
 ],
 "Kaal Sarp": [
  "काल सर्प",
  "Kaal Sarp"
 ],
 "Tithi": [
  "तिथि",
  "Tithi"
 ],
 "Paksha": [
  "पक्ष",
  "Paksha"
 ],
 "Vaar": [
  "वार",
  "Vaar"
 ],
 "Yoga": [
  "योग",
  "Yoga"
 ],
 "Karan": [
  "करण",
  "Karan"
 ],
 "Sunrise": [
  "सूर्योदय",
  "Sunrise"
 ],
 "Sunset": [
  "सूर्यास्त",
  "Sunset"
 ],
 "Rahu Kaal": [
  "राहु काल",
  "Rahu Kaal"
 ],
 "Choghadiya": [
  "चौघड़िया",
  "Choghadiya"
 ],
 "Muhurat": [
  "मुहूर्त",
  "Muhurat"
 ],
 "Mars House From Lagna": [
  "लग्न से मंगल भाव",
  "Lagna se Mangal bhav"
 ],
 "Mars House From Moon": [
  "चंद्र से मंगल भाव",
  "Chandra se Mangal bhav"
 ],
 "Mars House From Venus": [
  "शुक्र से मंगल भाव",
  "Shukra se Mangal bhav"
 ],
 "Practical Guidance": [
  "व्यावहारिक मार्गदर्शन",
  "Practical guidance"
 ],
 "Limitations": [
  "सीमाएँ",
  "Limitations"
 ],
 "Personal Edition": [
  "व्यक्तिगत संस्करण",
  "Personal edition"
 ],
 "VEDIC ASTROLOGY": [
  "वैदिक ज्योतिष",
  "Vedic jyotish"
 ],
 "PERSONAL EDITION": [
  "व्यक्तिगत संस्करण",
  "Personal edition"
 ],
 "02 / NATAL ARCHITECTURE": [
  "02 / जन्म कुंडली",
  "02 / Janm kundli"
 ],
 "03 / PLANETARY PLACEMENTS": [
  "03 / ग्रह स्थितियाँ",
  "03 / Graha positions"
 ],
 "04 / LIFE AREAS": [
  "04 / जीवन के क्षेत्र",
  "04 / Jeevan ke areas"
 ],
 "05 / TIMING FRAMEWORK": [
  "05 / दशा समयरेखा",
  "05 / Dasha timeline"
 ],
 "06 / TRADITIONAL INDICATORS": [
  "06 / पारंपरिक संकेत",
  "06 / Traditional sanket"
 ],
 "07 / NUMEROLOGY": [
  "07 / अंक ज्योतिष",
  "07 / Ank jyotish"
 ],
 "D1 / RASHI": [
  "D1 / राशि",
  "D1 / Rashi"
 ],
 "D9 / NAVAMSA": [
  "D9 / नवांश",
  "D9 / Navamsa"
 ],
 "02 / COMPATIBILITY": [
  "02 / मिलान",
  "02 / Matching"
 ],
 "PERSON 1 / D1": [
  "व्यक्ति 1 / D1",
  "Person 1 / D1"
 ],
 "PERSON 2 / D1": [
  "व्यक्ति 2 / D1",
  "Person 2 / D1"
 ],
 "ASHTAKOOT / MATCHING": [
  "अष्टकूट / मिलान",
  "Ashtakoot / Milan"
 ],
 "NUMEROLOGY": [
  "अंक ज्योतिष",
  "Ank jyotish"
 ],
 "NAME COMPARISON": [
  "नाम तुलना",
  "Naam comparison"
 ],
 "NAMING TRADITION": [
  "नामकरण परंपरा",
  "Naamkaran parampara"
 ],
 "TRADITIONAL RULES": [
  "पारंपरिक नियम",
  "Traditional niyam"
 ],
 "TIMING FRAMEWORK": [
  "दशा समयरेखा",
  "Dasha timeline"
 ],
 "TRANSIT CHECKPOINTS": [
  "गोचर संदर्भ तिथियाँ",
  "Gochar reference dates"
 ],
 "LIFE AREAS": [
  "जीवन के क्षेत्र",
  "Jeevan ke areas"
 ],
 "PLANETARY PLACEMENTS": [
  "ग्रह स्थितियाँ",
  "Graha positions"
 ],
 "SATURN / NATAL MOON": [
  "शनि / जन्म चंद्र",
  "Shani / Natal Chandra"
 ],
 "PRACTICAL GUIDANCE": [
  "व्यावहारिक मार्गदर्शन",
  "Practical guidance"
 ],
 "RELATIONSHIP REFLECTION": [
  "संबंध चिंतन",
  "Relationship reflection"
 ],
 "PERSONAL INTERPRETATION": [
  "व्यक्तिगत व्याख्या",
  "Personal vyakhya"
 ],
 "NOW": [
  "अब",
  "Ab"
 ],
 "Current": [
  "वर्तमान",
  "Current"
 ],
 "Past": [
  "बीती",
  "Beeti"
 ],
 "Upcoming": [
  "आगामी",
  "Aane wali"
 ],
 "Retrograde": [
  "वक्री",
  "Vakri"
 ],
 "Direct": [
  "मार्गी",
  "Margi"
 ],
 "Matches": [
  "मेल",
  "Matches"
 ],
 "Alternative": [
  "विकल्प",
  "Vikalp"
 ],
 "Not available": [
  "उपलब्ध नहीं",
  "Available nahi"
 ],
 "Yes": [
  "हाँ",
  "Haan"
 ],
 "No": [
  "नहीं",
  "Nahi"
 ],
 "Sun": [
  "सूर्य",
  "Surya"
 ],
 "Moon": [
  "चंद्र",
  "Chandra"
 ],
 "Mars": [
  "मंगल",
  "Mangal"
 ],
 "Mercury": [
  "बुध",
  "Budh"
 ],
 "Jupiter": [
  "गुरु",
  "Guru"
 ],
 "Venus": [
  "शुक्र",
  "Shukra"
 ],
 "Saturn": [
  "शनि",
  "Shani"
 ],
 "Rahu": [
  "राहु",
  "Rahu"
 ],
 "Ketu": [
  "केतु",
  "Ketu"
 ],
 "Aries": [
  "मेष",
  "Mesh"
 ],
 "Taurus": [
  "वृषभ",
  "Vrishabh"
 ],
 "Gemini": [
  "मिथुन",
  "Mithun"
 ],
 "Cancer": [
  "कर्क",
  "Kark"
 ],
 "Leo": [
  "सिंह",
  "Singh"
 ],
 "Virgo": [
  "कन्या",
  "Kanya"
 ],
 "Libra": [
  "तुला",
  "Tula"
 ],
 "Scorpio": [
  "वृश्चिक",
  "Vrishchik"
 ],
 "Sagittarius": [
  "धनु",
  "Dhanu"
 ],
 "Capricorn": [
  "मकर",
  "Makar"
 ],
 "Aquarius": [
  "कुंभ",
  "Kumbh"
 ],
 "Pisces": [
  "मीन",
  "Meen"
 ],
 "Ashwini": [
  "अश्विनी",
  "Ashwini"
 ],
 "Bharani": [
  "भरणी",
  "Bharani"
 ],
 "Krittika": [
  "कृत्तिका",
  "Krittika"
 ],
 "Rohini": [
  "रोहिणी",
  "Rohini"
 ],
 "Mrigashira": [
  "मृगशिरा",
  "Mrigashira"
 ],
 "Ardra": [
  "आर्द्रा",
  "Ardra"
 ],
 "Punarvasu": [
  "पुनर्वसु",
  "Punarvasu"
 ],
 "Pushya": [
  "पुष्य",
  "Pushya"
 ],
 "Ashlesha": [
  "आश्लेषा",
  "Ashlesha"
 ],
 "Magha": [
  "मघा",
  "Magha"
 ],
 "Purva Phalguni": [
  "पूर्व फाल्गुनी",
  "Purva Phalguni"
 ],
 "Uttara Phalguni": [
  "उत्तर फाल्गुनी",
  "Uttara Phalguni"
 ],
 "Hasta": [
  "हस्त",
  "Hasta"
 ],
 "Chitra": [
  "चित्रा",
  "Chitra"
 ],
 "Swati": [
  "स्वाती",
  "Swati"
 ],
 "Vishakha": [
  "विशाखा",
  "Vishakha"
 ],
 "Anuradha": [
  "अनुराधा",
  "Anuradha"
 ],
 "Jyeshtha": [
  "ज्येष्ठा",
  "Jyeshtha"
 ],
 "Mula": [
  "मूल",
  "Mula"
 ],
 "Purva Ashadha": [
  "पूर्व आषाढ़ा",
  "Purva Ashadha"
 ],
 "Uttara Ashadha": [
  "उत्तर आषाढ़ा",
  "Uttara Ashadha"
 ],
 "Shravana": [
  "श्रवण",
  "Shravana"
 ],
 "Dhanishta": [
  "धनिष्ठा",
  "Dhanishta"
 ],
 "Shatabhisha": [
  "शतभिषा",
  "Shatabhisha"
 ],
 "Purva Bhadrapada": [
  "पूर्व भाद्रपद",
  "Purva Bhadrapada"
 ],
 "Uttara Bhadrapada": [
  "उत्तर भाद्रपद",
  "Uttara Bhadrapada"
 ],
 "Revati": [
  "रेवती",
  "Revati"
 ],
 "Varna": [
  "वर्ण",
  "Varna"
 ],
 "Vashya": [
  "वश्य",
  "Vashya"
 ],
 "Tara": [
  "तारा",
  "Tara"
 ],
 "Yoni": [
  "योनि",
  "Yoni"
 ],
 "Graha Maitri": [
  "ग्रह मैत्री",
  "Graha Maitri"
 ],
 "Gana": [
  "गण",
  "Gana"
 ],
 "Bhakoot": [
  "भकूट",
  "Bhakoot"
 ],
 "Nadi": [
  "नाड़ी",
  "Nadi"
 ]
};
export function editorialTerm(value:string,locale:EditorialLocale):string {
 if(locale==="en"||!Object.prototype.hasOwnProperty.call(TERMS,value))return value;
 return TERMS[value][locale==="hi"?0:1];
}
export function editorialDate(value:string,locale:EditorialLocale):string {
 const day=value.slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return value;
 const dt=new Date(day+"T00:00:00Z");
 if(!Number.isFinite(dt.getTime())||dt.toISOString().slice(0,10)!==day)return value;
 return new Intl.DateTimeFormat(locale==="hi"?"hi-IN":"en-GB",{day:"2-digit",month:"short",year:"numeric",numberingSystem:"latn",timeZone:"UTC"}).format(dt);
}
export const EDITORIAL_TERM_COUNT=Object.keys(TERMS).length;
