import type { AstrologyLanguage } from "@/lib/astrology/types";

type ThreeEditions = readonly [string, string, string];
const exercises: Record<string, readonly ThreeEditions[]> = {
  "premium-kundli": [
    ["Locate this house on the D1 chart and write down what it contains.", "D1 कुंडली में यह भाव खोजें और इसमें स्थित ग्रहों के नाम लिखें।", "D1 kundli mein yeh bhav dhoondhein aur ismein baithe grah likhein."],
    ["Describe a recent choice involving this area. What helped you decide?", "इस क्षेत्र के किसी हाल के निर्णय को याद करें। चुनाव करने में किस बात से मदद मिली?", "Is vishay se juda apna haal ka ek faisla yaad karein. Chunne mein kis baat se madad mili?"],
    ["Try one change within your control, then compare the result with your original expectation.", "जो बदलाव आपके हाथ में हो, उसे आज़माएँ। वास्तविक परिणाम की तुलना अपनी शुरुआती अपेक्षा से करें।", "Apne bas ka ek badlaav aazmaayein. Asal nateeja apni pehli ummeed se milaayein."],
  ],
  "career-report": [
    ["Choose one piece of work a colleague can assess. Agree on an observable standard before starting.", "ऐसा एक काम चुनें जिसे कोई सहकर्मी जाँच सके। शुरू करने से पहले तय करें कि अच्छा काम कैसे पहचाना जाएगा।", "Ek aisa kaam chunein jo koi saathi dekh sake. Shuru karne se pehle tay karein ki achha kaam kise kahenge."],
    ["Try two ways to do a recurring task. Record the time and the errors for each.", "एक नियमित काम को दो तरीकों से करें। दोनों में लगा समय और हुई गलतियाँ लिखें।", "Roz ka ek kaam do tareekon se karein. Dono mein laga waqt aur hui galtiyan likhein."],
    ["Bring one work sample and one specific question to a feedback conversation.", "प्रतिक्रिया माँगते समय अपने काम का एक नमूना और उससे जुड़ा एक स्पष्ट प्रश्न साथ रखें।", "Feedback maangte waqt apne kaam ka ek namoona aur usse juda ek saaf sawaal saath rakhein."],
  ],
  "wealth-report": [
    ["Group one month of actual outgoings into fixed, flexible and occasional costs.", "एक महीने के वास्तविक खर्चों को नियमित, बदल सकने वाले और कभी-कभार होने वाले खर्चों में बाँटें।", "Ek mahine ke asal kharche baantein: tay, badal sakne waale aur kabhi-kabhaar hone waale."],
    ["Check one upcoming obligation against its written due date and amount.", "आने वाली किसी एक देनदारी की राशि और देय तिथि उसके दस्तावेज़ से मिलाएँ।", "Aane waali ek denadaari ki rakam aur tareekh uske kaagaz se milaayein."],
    ["Compare expected and actual spending in one category. Explain the largest difference using your records.", "एक श्रेणी में अनुमानित और वास्तविक खर्च की तुलना करें। सबसे बड़े अंतर का कारण अपने हिसाब से खोजें।", "Ek shreni mein socha hua aur hua kharch milaayein. Sabse bade farq ki vajah apne hisaab mein dekhein."],
  ],
  "love-report": [
    ["Write one preference you can express in your own words without guessing another person's feelings.", "दूसरे की भावनाओं का अनुमान लगाए बिना अपनी एक पसंद अपने शब्दों में लिखें।", "Doosre ki bhaavna ka andaaza lagaaye bina apni ek pasand apne shabdon mein likhein."],
    ["Ask an open question and give the other person room to decline or answer later.", "ऐसा खुला प्रश्न पूछें जिसका उत्तर सामने वाला अपनी इच्छा से अभी या बाद में दे सके।", "Khula sawaal poochhein aur saamne waale ko baad mein jawaab dene ya mana karne ki jagah dein."],
    ["Revisit one agreement. What worked for both people, and what needs a change?", "एक साझा सहमति पर फिर बात करें। क्या दोनों के लिए ठीक रहा और कहाँ बदलाव चाहिए?", "Ek saanjhi sahmati par phir baat karein. Dono ke liye kya theek raha aur kya badalna hai?"],
  ],
  "couple-kundli": [
    ["Each person can list one expectation about time together before comparing the two lists.", "पहले दोनों अलग-अलग लिखें कि साथ बिताए समय से उनकी क्या अपेक्षा है। फिर सूचियाँ मिलाएँ।", "Pehle dono alag likhein ki saath bitaaye waqt se unhein kya ummeed hai. Phir soochiyan milaayein."],
    ["Choose a topic on which you disagree. Let each person explain the other's view before offering a solution.", "एक असहमति चुनें। समाधान सुझाने से पहले दोनों एक-दूसरे का पक्ष अपने शब्दों में कहें।", "Ek asahmati chunein. Hal sujhaane se pehle dono ek-doosre ka paksh apne shabdon mein bataayein."],
    ["Note which agreements each person freely accepts and which questions are still open.", "लिखें कि किन बातों पर दोनों अपनी इच्छा से सहमत हैं और किन प्रश्नों पर बात बाकी है।", "Likhein kin baaton par dono apni marzi se sahmat hain aur kin savaalon par baat baaki hai."],
  ],
  "fortune-report": [
    ["Choose one opportunity you can actually pursue. Write the first action and the resource it requires.", "एक ऐसा अवसर चुनें जिस पर आप सचमुच काम कर सकें। पहला कदम और उसके लिए ज़रूरी साधन लिखें।", "Ek aisa mauka chunein jis par aap sachmuch kaam kar sakein. Pehla kadam aur uska zaroori saadhan likhein."],
    ["Compare two ways to pursue that opportunity using time, cost and support you have confirmed.", "दो रास्तों में लगने वाले समय, खर्च और उपलब्ध सहयोग की तुलना करें। जाँची हुई जानकारी इस्तेमाल करें।", "Do raaston mein lagne waale waqt, kharch aur pakke sahyog ki tulna karein."],
    ["Review the result against the goal you set. Which part came from preparation, and which from circumstances?", "परिणाम को अपने लक्ष्य से मिलाएँ। कहाँ तैयारी काम आई और कहाँ परिस्थितियों का असर था?", "Nateeje ko apne lakshya se milaayein. Kahaan taiyaari kaam aayi aur kahaan halaat ka asar tha?"],
  ],
  "yearly-horoscope-report": [
    ["Mark one dated commitment on your calendar alongside the monthly table.", "मासिक तालिका देखते हुए अपने कैलेंडर पर पहले से तय एक जिम्मेदारी दर्ज करें।", "Mahine ki taalika dekhte waqt apne calendar par ek tay zimmedaari darj karein."],
    ["Compare two consecutive monthly entries. Mark the date you can actually review a goal.", "लगातार दो महीनों की प्रविष्टियाँ मिलाएँ। वह तारीख चुनें जब आप अपने लक्ष्य की समीक्षा कर सकें।", "Lagaataar do mahino ki entries milaayein. Vah tareekh chunein jab aap lakshya par gaur kar sakein."],
    ["Review your calendar for a commitment that moved. Record the practical reason for that change.", "कैलेंडर में कोई बदली हुई तारीख खोजें और बदलाव का व्यावहारिक कारण लिखें।", "Calendar mein ek badli hui tareekh dhoondhein aur badlaav ki asal vajah likhein."],
  ],
  "transit-report": [
    ["Pick one planet in the dated table and follow its sign across the next two observations.", "तारीख वाली तालिका में एक ग्रह चुनें और अगली दो प्रविष्टियों में उसकी राशि देखें।", "Tareekh waali taalika mein ek grah chunein aur agli do entries mein uski rashi dekhein."],
    ["Identify two observations with the same sign and compare their degrees.", "एक ही राशि की दो प्रविष्टियाँ खोजें और उनके अंशों की तुलना करें।", "Ek hi rashi ki do entries dhoondhein aur unke ansh milaayein."],
    ["For a sign change, record both observation dates as a range. The table samples those dates.", "राशि बदलने पर दोनों अवलोकन तिथियाँ एक अंतराल के रूप में लिखें। तालिका में इन्हीं दिनों की स्थिति दी है।", "Rashi badalne par dono dekhi gayi tareekhein ek avadhi ki tarah likhein. Taalika unhi dinon ki sthiti dikhaati hai."],
  ],
  "jupiter-transit-report": [
    ["Read Jupiter's house from the natal Moon, then locate the same dated row from the ascendant.", "जन्म चंद्र से गुरु का भाव पढ़ें। उसी तारीख की पंक्ति में लग्न से गुरु का भाव देखें।", "Janm Chandra se Guru ka bhav padhein. Usi tareekh ki pankti mein lagna se Guru ka bhav dekhein."],
    ["Compare the first and last Jupiter rows and name the reference point you used.", "गुरु की पहली और आखिरी पंक्ति की तुलना करें। साथ में लिखें कि गिनती चंद्र से की या लग्न से।", "Guru ki pehli aur aakhiri pankti milaayein. Saath likhein ki ginti Chandra se ki ya lagna se."],
    ["Choose a learning opportunity and check its real schedule, prerequisites and available time.", "सीखने का एक अवसर चुनें। उसका वास्तविक समय, पूर्व आवश्यकताएँ और अपनी उपलब्धता जाँचें।", "Seekhne ka ek mauka chunein. Uska asli waqt, zaroori taiyaari aur apni fursat jaanchein."],
  ],
  "rahu-ketu-report": [
    ["Find both nodes in the same dated row; compare the two signs across the axis.", "एक ही तिथि में दोनों पात खोजें और अक्ष के दोनों सिरों की राशियाँ मिलाएँ।", "Ek hi tareekh mein dono paat dhoondhein aur aksh ke dono siron ki rashiyan milaayein."],
    ["Read the first and last nodal positions using the same reference point throughout.", "पहली और अंतिम पात स्थिति की तुलना करते समय पूरी गिनती एक ही संदर्भ बिंदु से करें।", "Pehli aur aakhiri paat sthiti ko poori baar ek hi sandarbh bindu se padhein."],
    ["Write one commitment to continue and one to let go. Give a practical reason for each.", "एक काम लिखें जिसे जारी रखना है और एक जिसे छोड़ना है। दोनों के व्यावहारिक कारण दें।", "Ek kaam likhein jo jaari rakhna hai aur ek jo chhodna hai. Dono ki vajah apne anubhav se dein."],
  ],
  "sade-sati-report": [
    ["Locate the natal Moon and the first dated Saturn entry to trace the stated phase.", "दी गई अवस्था को समझने के लिए जन्म चंद्र और शनि की पहली दिनांकित प्रविष्टि देखें।", "Di gayi avastha samajhne ke liye janm Chandra aur Shani ki pehli dinankit entry dekhein."],
    ["Compare two Saturn checkpoints with the three-sign sequence printed in the report.", "शनि की दो दिनांकित स्थितियों को रिपोर्ट में दी गई तीन राशियों के क्रम से मिलाएँ।", "Shani ki do tareekh waali sthitiyan report ki teen rashiyon ke kram se milaayein."],
    ["Choose one recurring responsibility you can simplify, and check whether it took less time.", "एक नियमित जिम्मेदारी सरल बनाने का तरीका आज़माएँ। देखें कि उसमें सचमुच कम समय लगा या नहीं।", "Roz ki ek zimmedaari aasaan karne ka tareeka aazmaayein. Dekhein ki kya sachmuch kam waqt laga."],
  ],
  "manglik-kaal-sarp-report": [
    ["Compare the listed Mars houses counted from the ascendant, Moon and Venus.", "लग्न, चंद्र और शुक्र से गिने गए मंगल के भावों को साथ रखकर देखें।", "Lagna, Chandra aur Shukra se gine Mangal ke bhav ek saath dekhein."],
    ["Use the nodal table to identify the endpoints of the arc and one planet tested against it.", "पातों की तालिका से चाप के दोनों सिरे और जाँचे गए किसी एक ग्रह की स्थिति पहचानें।", "Paaton ki taalika se chaap ke dono sire aur jaanche gaye ek grah ki sthiti pehchaanein."],
    ["Record which indicator follows from a single rule and which exceptions require a distinct reading.", "लिखें कि कौन-सा संकेत एक नियम से निकला है और किन अपवादों की अलग समीक्षा चाहिए।", "Likhein ki kaunsa sanket ek niyam se nikla aur kin apvaadon ki alag jaanch chahiye."],
  ],
  "baby-name-report": [
    ["Say the printed syllable aloud. Ask your family which pronunciation it uses before comparing names.", "दिए गए अक्षर को बोलकर देखें। नामों की तुलना से पहले परिवार में प्रचलित उच्चारण जान लें।", "Diya akshar bolkar dekhein. Naamon ki tulna se pehle parivaar mein chalne waala uchchaaran poochhein."],
    ["Read each proposed spelling beside the sound table. Keep pronunciation and the letter-sum result separate.", "हर प्रस्तावित वर्तनी ध्वनि तालिका के साथ पढ़ें। उच्चारण और अक्षरों के योग को अलग-अलग जाँचें।", "Har sujhaayi spelling dhwani taalika ke saath padhein. Uchchaaran aur aksharon ke yog ko alag jaanchein."],
  ],
};

export function reportPractice(slug: string, index: number, language: AstrologyLanguage) {
  const exercise = exercises[slug]?.[index];
  if (!exercise) return undefined;
  return exercise[language === "hi" ? 1 : language === "hinglish" ? 2 : 0];
}
