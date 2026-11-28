import type { Locale } from "@/lib/i18n";
import { pujaStatusNotice } from "@/lib/puja/customer-notices";

export type FulfilmentKind = "shop" | "puja";
const shopMessages = {
  CONFIRMED: ["Your order has been confirmed by the Naksharix team.", "नक्षरिक्स टीम ने आपके ऑर्डर की पुष्टि दर्ज की है।", "Naksharix team ne aapke order ki confirmation record ki hai."],
  PACKING: ["Our team has marked your order as being packed.", "टीम ने आपका ऑर्डर पैकिंग की स्थिति में दर्ज किया है।", "Team ne aapka order packing ki sthiti mein record kiya hai."],
  DISPATCHED: ["Our team has marked your order as dispatched. Check the tracking reference in your account.", "टीम ने आपका ऑर्डर भेजे जाने की स्थिति दर्ज की है। अपने खाते में ट्रैकिंग संदर्भ देखें।", "Team ne aapka order dispatch hone ki sthiti record ki hai. Apne account mein tracking reference dekhein."],
  DELIVERED: ["Our team has marked your order as delivered. Please review the order in your account.", "टीम ने आपका ऑर्डर डिलीवर होने की स्थिति दर्ज की है। अपने खाते में ऑर्डर जाँचें।", "Team ne aapka order delivered record kiya hai. Apne account mein order check karein."],
  CANCELED: ["Your order has been canceled. Check your account or contact support if you have questions.", "आपका ऑर्डर रद्द कर दिया गया है। अपना खाता देखें या प्रश्न होने पर सहायता से संपर्क करें।", "Aapka order cancel kar diya gaya hai. Apna account dekhein ya sawaal ho toh support se sampark karein."]
} as const;
const pujaHinglish = {
  CONFIRMED: "Team ne Pandit ki acceptance record ki hai. Puja ka exact samay abhi schedule hona hai. My Puja Requests mein confirmed schedule dikhne tak payment na karein.",
  SCHEDULED: "Team ne Puja ka samay aur approved Pandit confirm kiya hai. Payment se pehle My Puja Requests mein date, location aur amount check karein.",
  IN_PROGRESS: "Team ne Puja ko jaari sthiti mein record kiya hai. Apne account mein current status dekhein.",
  COMPLETED: "Team ne Puja complete hone ki sthiti record ki hai. Apne account mein completion details dekhein; kuch galat ho toh support se sampark karein.",
  CANCELED: "Aapki Puja request cancel kar di gayi hai. Agar payment kiya tha toh account mein refund status dekhein aur reconciliation ke liye support se sampark karein.",
  REJECTED: "Hum yeh Puja request accept nahi kar sake. Koi naya payment due nahi hai; madad ke liye support se sampark karein."
} as const;
const statusNames = {
  CONFIRMED: ["Confirmed", "पुष्टि दर्ज", "Confirmation record hui"], PACKING: ["Packing", "पैकिंग", "Packing"], DISPATCHED: ["Dispatched", "भेजा गया", "Dispatch hua"], DELIVERED: ["Delivered", "डिलीवरी दर्ज", "Delivery record hui"], CANCELED: ["Canceled", "रद्द", "Canceled"], SCHEDULED: ["Scheduled", "समय तय", "Samay tay hai"], IN_PROGRESS: ["In progress", "जारी", "Jaari hai"], COMPLETED: ["Completed", "पूरा होना दर्ज", "Completion record hui"], REJECTED: ["Rejected", "अस्वीकृत", "Accept nahi hua"]
} as const;
const common = {
  shopSubject: ["Naksharix order status updated", "नक्षरिक्स ऑर्डर की स्थिति बदली", "Naksharix order ki status update hui"],
  pujaSubject: ["Naksharix Puja booking status updated", "नक्षरिक्स पूजा बुकिंग की स्थिति बदली", "Naksharix Puja booking ki status update hui"],
  greeting: ["Namaste,", "नमस्ते,", "Namaste,"],
  reference: ["Reference", "संदर्भ", "Reference"],
  status: ["Status", "स्थिति", "Status"],
  schedule: ["Recorded ceremony date/time", "पूजा की दर्ज तारीख और समय", "Puja ki recorded date aur samay"],
  venue: ["Confirm the venue or online link with the coordinator.", "स्थान या ऑनलाइन लिंक की पुष्टि संयोजक से करें।", "Venue ya online link coordinator se confirm karein."],
  tracking: ["Track your request after signing in", "प्रवेश करके अपने अनुरोध की स्थिति देखें", "Sign in karke apni request ki status dekhein"],
  proof: ["This is a status notification, not a payment receipt or independent proof of delivery or ceremony completion.", "यह स्थिति की सूचना है। यह भुगतान की रसीद या डिलीवरी अथवा पूजा पूरी होने का स्वतंत्र प्रमाण नहीं है।", "Yeh status notification hai. Yeh payment receipt ya delivery athva Puja completion ka independent proof nahi hai."],
  payment: ["Only a verified Razorpay payment record proves a captured fee; no payment is due on an initial request.", "शुल्क प्राप्त होने का प्रमाण केवल सत्यापित Razorpay भुगतान रिकॉर्ड है; शुरुआती अनुरोध पर कोई भुगतान देय नहीं है।", "Captured fee ka proof sirf verified Razorpay payment record hai; initial request par koi payment due nahi hai."],
  support: ["If something is incorrect, contact Naksharix support at care@naksharix.com.", "कुछ गलत हो तो care@naksharix.com पर नक्षरिक्स सहायता से संपर्क करें।", "Kuch galat ho toh care@naksharix.com par Naksharix support se sampark karein."],
  privacy: ["Do not reply with passwords, OTPs, complete birth details or payment credentials.", "उत्तर में पासवर्ड, OTP, पूरा जन्म विवरण या भुगतान की गुप्त जानकारी न भेजें।", "Reply mein passwords, OTPs, poori birth details ya payment credentials na bhejein."]
} as const;
export function isNotifiableFulfilmentStatus(kind: FulfilmentKind, status: string): boolean {
  return Object.hasOwn(kind === "shop" ? shopMessages : pujaHinglish, status);
}
export function fulfilmentStatusEmail(input: {locale:Locale;kind:FulfilmentKind;reference:string;status:string;trackingUrl:string;scheduledAt:Date|null}) {
  if(!isNotifiableFulfilmentStatus(input.kind,input.status))return null;
  const index=input.locale==="hi"?1:input.locale==="hinglish"?2:0;
  const text=(key:keyof typeof common)=>common[key][index];
  const puja=pujaStatusNotice(input.status);
  const description=input.kind==="shop"?shopMessages[input.status as keyof typeof shopMessages][index]:input.locale==="hinglish"?pujaHinglish[input.status as keyof typeof pujaHinglish]:puja?.[input.locale];
  if(!description)return null;
  const schedule=input.kind==="puja"&&input.scheduledAt&&Number.isFinite(input.scheduledAt.getTime())
    ?text("schedule")+": "+input.scheduledAt.toLocaleString(input.locale==="hi"?"hi-IN":"en-IN",{timeZone:"Asia/Kolkata",timeZoneName:"short"})+". "+text("venue"):null;
  return {
    subject:text(input.kind==="shop"?"shopSubject":"pujaSubject"),
    text:[text("greeting"),"",description,...(schedule?[schedule]:[]),text("reference")+": "+input.reference,text("status")+": "+statusNames[input.status as keyof typeof statusNames][index],text("tracking")+": "+input.trackingUrl,"",text("proof"),...(input.kind==="puja"?[text("payment")]:[]),text("support"),text("privacy")].join("\n")
  };
}
