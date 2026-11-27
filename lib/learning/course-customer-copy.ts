import {selectCopy} from "@/lib/i18n-copy";
import type {Locale} from "@/lib/i18n";
const copy={
 title:["Vedic Astrology Foundations","वैदिक ज्योतिष की आधारशिला","Vedic Astrology ki buniyad"],
 intro:["Private English self-study course with seven guided modules and a purchased workbook. Lessons, questions, explanations and the workbook are in English. No live instructor or accredited qualification.","सात मार्गदर्शित खंडों और खरीदी गई अभ्यास-पुस्तिका वाला निजी स्वाध्याय पाठ्यक्रम। पाठ, प्रश्न, व्याख्याएँ और अभ्यास-पुस्तिका अंग्रेज़ी में हैं। इसमें लाइव शिक्षक या मान्यता प्राप्त योग्यता शामिल नहीं है।","Saat guided modules aur purchased workbook wala private self-study course. Lessons, questions, explanations aur workbook English mein hain. Live instructor ya accredited qualification shamil nahi hai."],
 select:["Select a purchased course","खरीदा गया पाठ्यक्रम चुनें","Purchased course chunein"],
 checking:["Checking course access…","पाठ्यक्रम का अधिकार जाँचा जा रहा है…","Course access check ho raha hai…"],
 required:["Verified course access is required.","सत्यापित पाठ्यक्रम अधिकार आवश्यक है।","Verified course access zaroori hai."],
 retry:["Refresh course access","पाठ्यक्रम का अधिकार ताज़ा करें","Course access refresh karein"],
 packages:["Your packages","आपके पैकेज","Aapke packages"],
 modules:["Course modules","पाठ्यक्रम के खंड","Course modules"],
 progress:["formative checks passed","अभ्यास-जाँच पूरी हुईं","formative checks pass hue"],
 progressLabel:["Learning progress","सीखने की प्रगति","Seekhne ki progress"],
 passed:["Passed","पूरी हुई","Pass hua"],
 example:["Worked example","समझाया गया उदाहरण","Samjhaya gaya example"],
 exercise:["Try it yourself","स्वयं अभ्यास करें","Khud practice karein"],
 understanding:["Check your understanding","अपनी समझ जाँचें","Apni samajh check karein"],
 assessing:["Checking…","जाँच चल रही है…","Check ho raha hai…"],
 assess:["Check answers and save progress","उत्तर जाँचें और प्रगति सहेजें","Answers check karke progress save karein"],
 saved:["Module check passed and progress saved.","खंड की जाँच पूरी हुई और प्रगति सहेजी गई।","Module check pass hua aur progress save hui."],
 review:["Review these explanations and try again.","इन व्याख्याओं को पढ़ें और फिर प्रयास करें।","Explanations padhein aur phir try karein."],
 correct:["Correct.","सही।","Sahi."],
 revise:["Review.","दोबारा देखें।","Dobara dekhein."],
 limits:["These checks measure understanding of the lesson examples, not professional qualification or accredited certification.","ये जाँच पाठ के उदाहरणों की समझ मापती हैं। इनसे पेशेवर योग्यता या मान्यता प्राप्त प्रमाणपत्र नहीं मिलता।","Ye checks lesson examples ki samajh maapte hain. Inse professional qualification ya accredited certificate nahi milta."],
 return:["Return to purchased workbook and package","खरीदी गई अभ्यास-पुस्तिका और पैकेज पर लौटें","Purchased workbook aur package par lautein"],
 unavailable:["Course data could not be verified. Refresh to check your current access.","पाठ्यक्रम की जानकारी की पुष्टि नहीं हुई। अपना वर्तमान अधिकार जाँचने के लिए ताज़ा करें।","Course data confirm nahi hua. Current access check karne ke liye refresh karein."],
 unauthorized:["Sign in with the account that owns the verified, non-refunded course purchase.","सत्यापित और बिना धनवापसी वाली पाठ्यक्रम खरीद के खाते से प्रवेश करें।","Verified aur non-refunded course purchase wale account se sign in karein."],
 limited:["Too many requests. Wait before refreshing or submitting again.","बहुत अधिक अनुरोध हुए हैं। ताज़ा करने या फिर भेजने से पहले प्रतीक्षा करें।","Requests zyada ho gayi hain. Refresh ya dobara submit karne se pehle rukein."],
 unconfirmed:["Assessment save was not confirmed. Your answers are kept here. Refresh the course before submitting again; this screen has not marked the module as passed.","जाँच सहेजने की पुष्टि नहीं हुई। आपके उत्तर यहीं रखे गए हैं। फिर भेजने से पहले पाठ्यक्रम ताज़ा करें; इस स्क्रीन ने खंड को पूरा नहीं माना है।","Assessment save confirm nahi hua. Aapke answers yahin hain. Dobara submit karne se pehle course refresh karein; screen ne module pass mark nahi kiya hai."],
} as const;
export const courseCustomerCopy=(locale:Locale)=>selectCopy(copy,locale);
export type CourseNotice="unavailable"|"unauthorized"|"limited"|"unconfirmed";
export function courseFailure(status:number):CourseNotice{return status===401||status===403?"unauthorized":status===429?"limited":"unavailable";}
