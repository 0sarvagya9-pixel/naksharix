/** Presentation-only vocabulary. Never translate names, addresses, questions,
 * numbers or arbitrary input through this dictionary. Unknown terms survive.
 * English output remains unchanged; Hindi/Hinglish use reviewed field labels.
 */
export type EditorialLocale="en"|"hi"|"hinglish";
// Shared layout contract: leave room for the widest normal-language house heading.
export const EDITORIAL_HOUSE_TABLE_FRACTIONS=[.72,.85,1.3,3.34] as const;
const TERMS:Record<string,readonly [string,string]>={
 "Rule-based indicators, not guarantees or diagnoses.": ["ये संकेत पारंपरिक नियमों पर आधारित हैं। इनसे किसी परिणाम या निदान की पुष्टि नहीं होती।", "Yeh paramparik rules par aadharit sanket hain. Inse kisi outcome ya diagnosis ki pushti nahi hoti."],
 "Remedies": ["उपाय","Upay"],
 "Nadi Dosha": ["नाड़ी दोष","Nadi dosh"],
 "Bhakoot Dosha": ["भकूट दोष","Bhakoot dosh"],
 "Nadi Dosh": ["नाड़ी दोष","Nadi dosh"],
 "Bhakoot Dosh": ["भकूट दोष","Bhakoot dosh"],
 "Traditional compatibility scoring is not a prediction of marriage success.": ["पारंपरिक मिलान के अंक विवाह की सफलता का पूर्वानुमान नहीं देते।", "Paramparik milan ke ank shaadi ki safalta ka forecast nahi dete."],
 "Transliterations and naming traditions vary; confirm the pronunciation with your family or a qualified priest.": ["लिप्यंतरण और नामकरण की परंपराएँ भिन्न हो सकती हैं। उच्चारण की पुष्टि अपने परिवार या जानकार पुरोहित से करें।", "Transliteration aur naamkaran ki paramparayein alag ho sakti hain. Uchcharan apne parivar ya jaankar purohit se confirm karein."],
 "Illustrative spellings, not verified meanings or guarantees; no name determines a child's future.": ["ये वर्तनियाँ उदाहरण हैं। इनके अर्थों का स्वतंत्र सत्यापन नहीं हुआ है। बच्चे का भविष्य उसके नाम से निर्धारित नहीं होता।", "Yeh spellings misaal hain. Inke arthon ka independent verification nahi hua hai. Bachche ka bhavishya uske naam se tay nahi hota."],
 "Sampled sign positions, not exact ingress or departure times; no predicted loss or misfortune.": ["अलग-अलग तिथियों पर ली गई राशि स्थितियाँ दिखाई गई हैं। प्रवेश और निर्गमन का सटीक समय इनसे तय नहीं होता। इनसे हानि या दुर्भाग्य की भविष्यवाणी नहीं की जाती।", "Alag tareekhon ki rashi positions dikhayi gayi hain. Exact entry aur exit time inse tay nahi hota. Yeh nuksan ya durbhagya ki prediction nahi hain."],
 "Traditions differ on exceptions and cancellation; no life outcome is guaranteed.": ["अपवाद और दोष-निरस्तीकरण के नियम परंपरा के अनुसार बदलते हैं। किसी जीवन-परिणाम की गारंटी नहीं है।", "Apvaad aur dosha cancellation ke niyam parampara ke hisaab se badalte hain. Kisi life outcome ki guarantee nahi hai."],
 "First-day snapshots, not a date-specific forecast.": ["प्रत्येक माह की पहली तारीख की स्थिति दी गई है। यह किसी दिन की घटना का पूर्वानुमान नहीं है।", "Har mahine ki pehli tareekh ki grah sthiti di gayi hai. Yeh kisi din ki ghatna ka forecast nahi hai."],
 "Reference snapshots; exact station and ingress times are not certified.": ["इन तिथियों की स्थितियाँ संदर्भ के लिए हैं। वक्री या मार्गी होने और राशि में प्रवेश के सटीक समय का प्रमाणीकरण नहीं हुआ है।", "In tareekhon ki positions reference ke liye hain. Station aur rashi pravesh ke exact time ka certification nahi hua hai."],
 "Mean lunar nodes are used.": ["गणना में चंद्रमा के माध्य पातों का उपयोग हुआ है।", "Calculation mein Chandra ke mean nodes istemal huye hain."],
 "Snapshots do not establish exact ingress dates or guarantee favorable outcomes.": ["चुनी तिथियों की स्थितियों से राशि में प्रवेश की सटीक तिथि या अनुकूल परिणाम निश्चित नहीं होते।", "Chuni tareekhon ki positions se exact rashi pravesh ki tareekh ya favorable outcome tay nahi hote."],
 "Numerology is a symbolic comparison, not proof that a spelling changes luck.": ["अंक ज्योतिष में वर्तनियों की प्रतीकात्मक तुलना होती है। वर्तनी बदलने से भाग्य बदलने का प्रमाण नहीं है।", "Numerology mein spellings ka symbolic comparison hota hai. Spelling badalne se kismat badalne ka pramaan nahi hai."],
 "Needs full chart, strength, aspects, and dasha review before final judgment.": ["निष्कर्ष निकालने से पहले पूरी कुंडली, ग्रह बल, दृष्टियों और दशा की समीक्षा करें।", "Nateeja nikalne se pehle poori kundli, grah bal, drishti aur dasha ki samiksha karein."],
 "Whole sign": ["पूर्ण राशि भाव", "Poorn rashi bhav"],
 "Mean lunar node benchmark mode": ["चंद्रमा के माध्य पातों की संदर्भ पद्धति", "Chandra ke mean nodes ki reference paddhati"],
 "Outside three-sign Sade Sati": ["साढ़ेसाती की तीन राशियों से बाहर", "Sade Sati ki teen rashiyon se baahar"],
 "Rising / first sign": ["पहला चरण / जन्म चंद्र से पिछली राशि", "Pehla charan / janm Chandra se pichhli rashi"],
 "Middle / natal Moon sign": ["मध्य चरण / जन्म चंद्र राशि", "Madhya charan / janm Chandra rashi"],
 "Setting / next sign": ["अंतिम चरण / जन्म चंद्र से अगली राशि", "Antim charan / janm Chandra se agli rashi"],
 "Budh Aditya Yoga": ["बुध आदित्य योग", "Budh Aditya Yog"],
 "Gaja Kesari Yoga": ["गजकेसरी योग", "Gajakesari Yog"],
 "Chandra Mangal Yoga": ["चंद्र मंगल योग", "Chandra Mangal Yog"],
 "Ruchaka Yoga": ["रुचक योग", "Ruchak Yog"],
 "Bhadra Yoga": ["भद्र योग", "Bhadra Yog"],
 "Hamsa Yoga": ["हंस योग", "Hansa Yog"],
 "Malavya Yoga": ["मालव्य योग", "Malavya Yog"],
 "Shasha Yoga": ["शश योग", "Shasha Yog"],
 "Mild": ["हल्का","Halka"],
 "Moderate": ["मध्यम","Madhyam"],
 "Severe": ["गंभीर","Gambhir"],
 "High": ["उच्च","Zyada"],
 "Low": ["कम","Kam"],
 "Near station": ["स्थिरता के निकट","Station ke paas"],
 "Not clearly detected": ["स्पष्ट रूप से नहीं पाया गया","Spasht roop se nahi mila"],
 "Current Mahadasha": ["वर्तमान महादशा","Vartaman Mahadasha"],
 "Current Antardasha": ["वर्तमान अंतर्दशा","Vartaman Antardasha"],
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
 "Number symbolism / reflection": [
  "अंक की व्याख्या / चिंतन",
  "Ank ki vyakhya / reflection"
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
export type EditorialDoshaKind="manglik"|"kaalSarp"|"factor";
/** Describe the supplied rule evidence without turning a hit count into a
 * severity measure. This changes presentation only, never the engine result.
 * Missing/inconsistent evidence must not be presented as a negative finding.
 */
export function editorialDoshaPresentation(assessment:Record<string,unknown>,locale:EditorialLocale,kind:EditorialDoshaKind):{title:string;body:string}{
 const tr=(en:string,hi:string,hinglish:string)=>locale==="hi"?hi:locale==="hinglish"?hinglish:en;
 const text=(value:unknown)=>typeof value==="string"?value:"";
 const remedies=Array.isArray(assessment.remedies)?assessment.remedies.filter((value):value is string=>typeof value==="string").join("\n"):text(assessment.remedies);
 const body=(...parts:string[])=>parts.filter(Boolean).join("\n");
 const unavailable=(reason:string)=>({title:editorialTerm("Not available",locale),body:body(reason,remedies)});
 if(assessment.available===false||typeof assessment.present!=="boolean")return unavailable(text(assessment.summary));
 if(kind==="manglik"){
  const houses=[assessment.marsHouseFromLagna,assessment.marsHouseFromMoon,assessment.marsHouseFromVenus];
  if(!houses.every((value):value is number=>typeof value==="number"&&Number.isInteger(value)&&value>=1&&value<=12)){
   return unavailable(tr("Three valid reference houses are required for this rule assessment.","इस नियम की जाँच के लिए तीनों संदर्भों से मंगल का सही भाव चाहिए।","Is niyam ki jaanch ke liye teenon sandarbhon se Mangal ka sahi bhav chahiye."));
  }
  // This is the explicitly declared six-house convention used by the supplied
  // engine assessment; exceptions and the separate five-house variant are not
  // silently substituted. The semantic QA compares this display to engine data.
  const sensitive=new Set([1,2,4,7,8,12]);
  const references=tr("Lagna|Moon|Venus","लग्न|चंद्र|शुक्र","Lagna|Chandra|Shukra").split("|");
  const matched=references.filter((_,index)=>sensitive.has(houses[index]));
  const referenceLine=tr("Mars houses: ","मंगल का भाव: ","Mangal ka bhav: ")+references.map((reference,index)=>tr("from "+reference,reference+" से",reference+" se")+" "+houses[index]).join(" · ");
  if(assessment.present!==(matched.length>0))return unavailable(body(tr("The rule result and reference houses disagree; the calculation needs review.","नियम का परिणाम और संदर्भ भाव मेल नहीं खाते। गणना की समीक्षा आवश्यक है।","Niyam ka natija aur sandarbh bhav mel nahi khate. Ganana ki samiksha zaroori hai."),referenceLine));
  return {
   title:tr("Rule matches: ","नियम का मेल: ","Niyam se mel: ")+matched.length+" / 3",
   body:body(referenceLine,
    tr("Six-house rule: 1, 2, 4, 7, 8, 12. Matches: ","नियम के छह भाव: 1, 2, 4, 7, 8, 12। मेल: ","Niyam ke chhah bhav: 1, 2, 4, 7, 8, 12. Mel: ")+(matched.join(", ")||tr("None","कोई नहीं","Koi nahi")),
    tr("This count does not measure severity or predict marriage outcomes.","यह गिनती दोष की तीव्रता या विवाह का परिणाम नहीं बताती।","Yeh ginti dosh ki teevrata ya shaadi ka natija nahi batati."),remedies)
  };
 }
 const title=assessment.present?tr("Rule matched","नियम से मेल मिला","Niyam se mel mila"):tr("Rule not matched","नियम से मेल नहीं मिला","Niyam se mel nahi mila");
 if(kind==="kaalSarp")return {title,body:body(assessment.present
  ?tr("The seven classical grahas are all in one Rahu–Ketu semicircle, including its boundary points.","सातों पारंपरिक ग्रह राहु-केतु के बीच एक ही अर्धवृत्त में आते हैं। इस नियम में सीमा-बिंदु शामिल हैं।","Saaton paramparik grah Rahu-Ketu ke beech ek hi ardhvritt mein aate hain. Is niyam mein seema ke bindu shaamil hain.")
  :tr("The seven classical grahas are not all in one Rahu–Ketu semicircle, including its boundary points.","सातों पारंपरिक ग्रह राहु-केतु के बीच एक ही अर्धवृत्त में नहीं आते। इस नियम में सीमा-बिंदु शामिल हैं।","Saaton paramparik grah Rahu-Ketu ke beech ek hi ardhvritt mein nahi aate. Is niyam mein seema ke bindu shaamil hain."),
  tr("This geometry does not predict harm.","इस ज्यामितीय नियम से हानि का पूर्वानुमान नहीं होता।","Isse nuksan ki bhavishyavaani nahi hoti."),remedies)};
 return {title,body:body(text(assessment.summary),remedies)};
}
export const EDITORIAL_TERM_COUNT=Object.keys(TERMS).length;
