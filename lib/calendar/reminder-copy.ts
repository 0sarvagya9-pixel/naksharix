import type {Locale} from "@/lib/i18n";
import {festivalHindi,kumbhGuideDates,indiaEclipseDates} from "@/lib/seo-seasonal";
const messages={
 title:["2027 Reference Reminders","2027 संदर्भ तिथि अनुस्मारक","2027 reference date reminders"],
 intro:["Choose optional email reminders for reviewed dates. Only verified purchases qualify; the free calendar remains available. No guaranteed inbox delivery or ceremony reservation.","समीक्षित तिथियों के लिए वैकल्पिक ईमेल अनुस्मारक चुनें। केवल सत्यापित खरीद पात्र है; निःशुल्क कैलेंडर उपलब्ध है। इनबॉक्स में पहुँचने या अनुष्ठान आरक्षण की गारंटी नहीं है।","Reviewed dates ke liye optional email reminders chunein. Sirf verified purchases eligible hain; free calendar available hai. Inbox delivery ya ceremony reservation ki guarantee nahi hai."],
 packages:["Digital packages","डिजिटल पैकेज","Digital packages"],
 calendar:["Free calendar","निःशुल्क कैलेंडर","Free calendar"],
 refresh:["Refresh","फिर जाँचें","Refresh karein"],
 checking:["Checking reminder records…","अनुस्मारक रिकॉर्ड जाँचे जा रहे हैं…","Reminder records check ho rahe hain…"],
 unavailable:["Reminder status could not be checked. Refresh before retrying.","अनुस्मारक की स्थिति जाँची नहीं जा सकी। फिर प्रयास करने से पहले स्थिति जाँचें।","Reminder status check nahi ho saka. Retry se pehle refresh karein."],
 inactive:["Scheduling is unavailable. You can still cancel scheduled reminders.","नया अनुस्मारक तय करना उपलब्ध नहीं है। पहले से तय अनुस्मारक अभी भी रद्द कर सकते हैं।","Naya reminder schedule karna available nahi hai. Pehle se scheduled reminders cancel kar sakte hain."],
 purchase:["A verified 2027 reminder-package purchase is required. The free calendar needs no purchase.","सत्यापित 2027 अनुस्मारक पैकेज खरीद आवश्यक है। निःशुल्क कैलेंडर के लिए खरीद आवश्यक नहीं है।","Verified 2027 reminder-package purchase zaroori hai. Free calendar ke liye purchase nahi chahiye."],
 order:["Verified order","सत्यापित ऑर्डर","Verified order"],
 lead:["Advance notice","कितने दिन पहले","Kitne din pehle"],
 one:["One day before","एक दिन पहले","Ek din pehle"],
 seven:["Seven days before","सात दिन पहले","Saat din pehle"],
 event:["Reference event","संदर्भ अवसर","Reference event"],
 select:["Select an event","अवसर चुनें","Event chunein"],
 consent:["I request this specific reminder at my verified account email, subject to available daily capacity. I can cancel before processing. This is not marketing consent.","उपलब्ध दैनिक क्षमता के अधीन मैं अपने खाते के सत्यापित ईमेल पर यह विशेष अनुस्मारक चाहता/चाहती हूँ। प्रक्रिया शुरू होने से पहले इसे रद्द कर सकता/सकती हूँ। यह प्रचार की सहमति नहीं है।","Daily capacity available hone par main apne verified account email par yeh specific reminder chahta/chahti hoon. Processing se pehle cancel kar sakta/sakti hoon. Yeh marketing consent nahi hai."],
 schedule:["Schedule reminder","अनुस्मारक तय करें","Reminder schedule karein"],
 your:["Your reminders","आपके अनुस्मारक","Aapke reminders"],
 empty:["No reminders scheduled.","कोई अनुस्मारक तय नहीं है।","Koi reminder scheduled nahi hai."],
 cancel:["Cancel","रद्द करें","Cancel karein"],
 scheduled:["Reminder scheduled; inbox delivery is not guaranteed.","अनुस्मारक तय हुआ; इनबॉक्स में पहुँचने की गारंटी नहीं है।","Reminder scheduled hua; inbox delivery ki guarantee nahi hai."],
 canceled:["Reminder canceled.","अनुस्मारक रद्द हुआ।","Reminder cancel hua."],
 uncertain:["The change could not be confirmed. Refresh records before retrying and confirm your choice again.","बदलाव की पुष्टि नहीं हो सकी। फिर प्रयास करने से पहले रिकॉर्ड जाँचें और अपना चयन दोबारा पुष्ट करें।","Change confirm nahi hua. Retry se pehle records refresh karein aur apna selection dobara confirm karein."],
 signedOut:["Sign in again to manage reminders.","अनुस्मारक प्रबंधित करने के लिए फिर प्रवेश करें।","Reminders manage karne ke liye phir sign in karein."],
 declined:["This reminder is not currently eligible. Refresh the records and review the date, purchase and consent.","यह अनुस्मारक अभी पात्र नहीं है। रिकॉर्ड फिर जाँचकर तिथि, खरीद और सहमति देखें।","Yeh reminder abhi eligible nahi hai. Records refresh karke date, purchase aur consent check karein."],
 limited:["Too many requests. Wait and refresh the records before retrying.","अनुरोधों की सीमा पूरी हो गई है। प्रतीक्षा करके रिकॉर्ड जाँचें, फिर प्रयास करें।","Requests ki limit poori hai. Ruk kar records refresh karein, phir retry karein."],
 SCHEDULED:["Scheduled","तय","Scheduled"],
 CLAIMED:["Processing","प्रक्रिया में","Processing"],
 ACCEPTED:["Provider accepted; inbox not confirmed","प्रदाता ने स्वीकार किया; इनबॉक्स की पुष्टि नहीं","Provider ne accept kiya; inbox confirm nahi"],
 CANCELED:["Canceled","रद्द","Canceled"],
 SKIPPED:["Not sent — expired or no permission","नहीं भेजा गया — अवधि समाप्त या अनुमति नहीं","Nahi bheja — expire ya permission nahi"],
 UNKNOWN:["Delivery uncertain; no automatic duplicate","डिलीवरी अनिश्चित; अपने-आप दोबारा नहीं भेजा जाएगा","Delivery uncertain; automatic duplicate nahi"],
 emailSubject:["Naksharix: your requested reference-date reminder","Naksharix: आपका अनुरोधित संदर्भ तिथि अनुस्मारक","Naksharix: aapka requested reference-date reminder"],
 emailRequested:["You requested this reminder.","आपने इस अनुस्मारक का अनुरोध किया था।","Aapne is reminder ki request ki thi."],
 emailDisclaimer:["Confirm local timing and current official notices. This is not a booking or guaranteed muhurat.","स्थानीय समय और वर्तमान आधिकारिक सूचनाएँ जाँचें। यह बुकिंग या निश्चित मुहूर्त नहीं है।","Local timing aur current official notices check karein. Yeh booking ya guaranteed muhurat nahi hai."],
 emailSource:["Source:","स्रोत:","Source:"],
 emailManage:["Manage future reminders:","आगे के अनुस्मारक प्रबंधित करें:","Aage ke reminders manage karein:"]
} as const;
export function reminderCopy(locale:Locale){const index=locale==="hi"?1:locale==="hinglish"?2:0;return Object.fromEntries(Object.entries(messages).map(([key,values])=>[key,values[index]])) as {[K in keyof typeof messages]:string};}
const hinge:Record<string,string>={"Main Mela begins":"Mukhya mela shuru","Main Mela period ends":"Mukhya mela avadhi samapt","First Amrut Snan":"Pehla Amrit Snan","Second Amrut Snan":"Doosra Amrit Snan","Third Amrut Snan — Nashik":"Teesra Amrit Snan — Nashik","Third Amrut Snan — Trimbakeshwar":"Teesra Amrit Snan — Trimbakeshwar","Penumbral lunar eclipse":"Upchhaya Chandra Grahan","Partial solar eclipse in India":"Bharat mein aanshik Surya Grahan"};
export function reminderEventName(event:{name:string},locale:Locale){if(locale==="en")return event.name;if(locale==="hinglish")return hinge[event.name]??event.name;return festivalHindi[event.name]??kumbhGuideDates.find(row=>row.en===event.name)?.hi??indiaEclipseDates.find(row=>row.en===event.name)?.hi??event.name;}
export function reminderEmail(locale:Locale,event:{name:string;date:string;sourceUrl:string}){const copy=reminderCopy(locale);return {subject:copy.emailSubject,text:[copy.emailRequested,reminderEventName(event,locale)+" — "+event.date,copy.emailDisclaimer,copy.emailSource+" "+event.sourceUrl,copy.emailManage+" https://www.naksharix.com/reference-reminders"].join("\n\n")};}
