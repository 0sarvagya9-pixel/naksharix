import type { Locale } from "@/lib/i18n";

const messages = {
  customerTitle: ["Support Centre", "सहायता केंद्र", "Support Centre"],
  customerEyebrow: ["Customer Support", "ग्राहक सहायता", "Customer support"],
  customerIntro: ["Submit a private support request and track its current status.", "निजी सहायता अनुरोध भेजें और उसकी वर्तमान स्थिति देखें।", "Private support request bhejein aur uski current status dekhein."],
  customerMetadata: ["View and manage private customer support requests.", "अपने निजी सहायता अनुरोध देखें और प्रबंधित करें।", "Apni private support requests dekhein aur manage karein."],
  adminTitle: ["Support Desk", "सहायता प्रबंधन", "Support Desk"],
  adminEyebrow: ["Admin Operations", "प्रशासक संचालन", "Admin operations"],
  adminIntro: ["Review customer requests and update their priority and status.", "ग्राहक अनुरोधों की समीक्षा करें और उनकी प्राथमिकता व स्थिति बदलें।", "Customer requests review karke unki priority aur status update karein."],
  adminMetadata: ["Authorized admin support ticket management.", "अधिकृत प्रशासक द्वारा सहायता अनुरोध प्रबंधन।", "Authorized admin support request management."],
  partnership: ["Partnership enquiry", "साझेदारी संबंधी पूछताछ", "Partnership ke liye poochtaach"],
  backDashboard: ["Back to dashboard", "डैशबोर्ड पर लौटें", "Dashboard par lautein"],
  backAdmin: ["Back to Admin", "प्रशासन पर लौटें", "Admin par lautein"],
  newRequest: ["New support request", "नया सहायता अनुरोध", "Nayi support request"],
  subject: ["Subject", "विषय", "Subject"],
  subjectHint: ["What do you need help with?", "आपको किस विषय में सहायता चाहिए?", "Aapko kis cheez mein madad chahiye?"],
  details: ["Details", "विवरण", "Details"],
  detailsHint: ["Describe the issue without sharing passwords or payment credentials.", "पासवर्ड या भुगतान संबंधी गोपनीय जानकारी दिए बिना समस्या बताएँ।", "Password ya payment credentials share kiye bina problem batayein."],
  submitting: ["Submitting...", "भेजा जा रहा है...", "Bhej rahe hain..."],
  submit: ["Submit support request", "सहायता अनुरोध भेजें", "Support request bhejein"],
  restoreDetails: ["Restore unconfirmed details", "अपुष्ट विवरण वापस लाएँ", "Unconfirmed details wapas laayein"],
  requests: ["Your requests", "आपके अनुरोध", "Aapki requests"],
  loading: ["Loading support requests...", "सहायता अनुरोध लोड हो रहे हैं...", "Support requests load ho rahi hain..."],
  emptyCustomer: ["You have no support requests.", "आपका कोई सहायता अनुरोध नहीं है।", "Aapki koi support request nahi hai."],
  emptyAdmin: ["There are no support requests yet.", "अभी कोई सहायता अनुरोध नहीं है।", "Abhi koi support request nahi hai."],
  privacy: ["Support tickets are visible only to your account and authorized staff. Never include passwords, OTPs or card details.", "सहायता अनुरोध केवल आपके खाते और अधिकृत कर्मचारियों को दिखाई देते हैं। पासवर्ड, OTP या कार्ड विवरण कभी न दें।", "Support tickets sirf aapke account aur authorized staff ko dikhte hain. Password, OTP ya card details kabhi na dein."],
  created: ["Created", "बनाया गया", "Banaya gaya"],
  priority: ["Priority", "प्राथमिकता", "Priority"],
  status: ["Status", "स्थिति", "Status"],
  refresh: ["Refresh saved requests", "सहेजे गए अनुरोध फिर देखें", "Saved requests refresh karein"],
  refreshing: ["Refreshing...", "फिर लोड हो रहा है...", "Refresh ho raha hai..."],
  save: ["Save", "सहेजें", "Save karein"],
  saving: ["Saving...", "सहेजा जा रहा है...", "Save ho raha hai..."],
  recorded: ["Your support request has been recorded.", "आपका सहायता अनुरोध दर्ज हो गया है।", "Aapki support request record ho gayi hai."],
  reviewSaved: ["Support ticket status and priority saved.", "अनुरोध की स्थिति और प्राथमिकता सहेज दी गई है।", "Ticket ki status aur priority save ho gayi hai."],
  conversation: ["Support conversation", "सहायता बातचीत", "Support conversation"],
  staff: ["Naksharix Support", "Naksharix सहायता", "Naksharix Support"],
  customer: ["Customer", "ग्राहक", "Customer"],
  closed: ["Ticket resolved or closed; reopen before replying.", "अनुरोध हल या बंद हो चुका है; उत्तर देने से पहले फिर खोलें।", "Ticket resolve ya close ho chuki hai; reply se pehle reopen karein."],
  replyLabel: ["Reply to this ticket", "इस अनुरोध का उत्तर दें", "Is ticket ka reply dein"],
  replyHint: ["Reply without passwords, OTPs or card details.", "पासवर्ड, OTP या कार्ड विवरण दिए बिना उत्तर दें।", "Password, OTP ya card details diye bina reply dein."],
  sending: ["Sending...", "भेजा जा रहा है...", "Bhej rahe hain..."],
  send: ["Send reply", "उत्तर भेजें", "Reply bhejein"],
  restoreReply: ["Restore unconfirmed reply", "अपुष्ट उत्तर वापस लाएँ", "Unconfirmed reply wapas laayein"],
  replyRecorded: ["Reply recorded.", "उत्तर दर्ज हो गया है।", "Reply record ho gaya hai."],
  replyProvider: ["Reply saved. Email provider accepted a customer notification; inbox delivery is not confirmed.", "उत्तर सहेज दिया गया है। ईमेल सेवा ने ग्राहक सूचना स्वीकार की है; inbox तक पहुँचने की पुष्टि नहीं है।", "Reply save ho gaya. Email provider ne customer notification accept kiya; inbox delivery confirm nahi hai."],
  replyPrivate: ["Reply saved in the private customer support desk. Email notification was not confirmed.", "उत्तर निजी ग्राहक सहायता केंद्र में सहेजा गया है। ईमेल सूचना की पुष्टि नहीं हुई।", "Reply private customer support desk mein save hai. Email notification confirm nahi hua."],
  unavailable: ["Support requests could not be verified. Refresh to try again.", "सहायता अनुरोधों की पुष्टि नहीं हो सकी। फिर लोड करके प्रयास करें।", "Support requests verify nahi ho sakin. Refresh karke phir try karein."],
  unauthorized: ["Sign in with the authorized account, then try again.", "अधिकृत खाते से प्रवेश करके फिर प्रयास करें।", "Authorized account se sign in karke phir try karein."],
  invalid: ["Check the required fields and their length, then try again.", "आवश्यक जानकारी और उसकी लंबाई जाँचकर फिर प्रयास करें।", "Required fields aur unki length check karke phir try karein."],
  conflict: ["The saved request may have changed. Refresh before making another change.", "सहेजा गया अनुरोध बदल सकता है। दूसरा बदलाव करने से पहले फिर लोड करें।", "Saved request badal sakti hai. Agle change se pehle refresh karein."],
  limited: ["The request limit has been reached. Wait before trying again.", "अनुरोध की सीमा पूरी हो गई है। फिर प्रयास करने से पहले प्रतीक्षा करें।", "Request limit poori ho gayi hai. Phir try karne se pehle rukein."],
  unconfirmed: ["The change could not be confirmed. Check saved requests before retrying unchanged details.", "बदलाव की पुष्टि नहीं हो सकी। वही विवरण दोबारा भेजने से पहले सहेजे गए अनुरोध देखें।", "Change confirm nahi hua. Wahi details retry karne se pehle saved requests dekhein."],
  originalRequest: ["A previous request is not confirmed. Restore its original details and check existing requests before retrying.", "पिछले अनुरोध की पुष्टि नहीं हुई है। मूल विवरण वापस लाकर दोबारा प्रयास करने से पहले मौजूदा अनुरोध देखें।", "Pichhli request confirm nahi hui. Original details restore karein aur retry se pehle existing requests dekhein."],
  originalReply: ["A previous reply is not confirmed. Restore its original text and check the conversation before retrying.", "पिछले उत्तर की पुष्टि नहीं हुई है। मूल पाठ वापस लाकर दोबारा भेजने से पहले बातचीत देखें।", "Pichhla reply confirm nahi hua. Original text restore karein aur retry se pehle conversation dekhein."],
  savedRefreshFailed: ["The change was recorded, but the list could not refresh. Refresh to view the saved record.", "बदलाव दर्ज हो गया है, लेकिन सूची फिर लोड नहीं हुई। सहेजा गया रिकॉर्ड देखने के लिए फिर लोड करें।", "Change record ho gaya, lekin list refresh nahi hui. Saved record dekhne ke liye refresh karein."],
  unknown: ["Unrecognized status", "अज्ञात स्थिति", "Unknown status"],
  OPEN: ["Open", "खुला", "Open"],
  IN_PROGRESS: ["In progress", "कार्य जारी", "Kaam jaari"],
  RESOLVED: ["Resolved", "हल किया गया", "Resolve ho gaya"],
  CLOSED: ["Closed", "बंद", "Closed"],
  LOW: ["Low", "कम", "Kam"],
  NORMAL: ["Normal", "सामान्य", "Normal"],
  HIGH: ["High", "उच्च", "High"]
} as const;

export type SupportCopyKey = keyof typeof messages;
export function supportCopy(locale: Locale) {
  const index = locale === "hi" ? 1 : locale === "hinglish" ? 2 : 0;
  return Object.fromEntries(Object.entries(messages).map(([key, value]) => [key, value[index]])) as Record<SupportCopyKey, string>;
}
export function supportState(value: string, locale: Locale) {
  const copy = supportCopy(locale);
  return ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "LOW", "NORMAL", "HIGH"].includes(value) ? copy[value as SupportCopyKey] : copy.unknown;
}
export function supportFailure(status: number): SupportCopyKey {
  return status === 401 || status === 403 ? "unauthorized" : status === 422 ? "invalid" : status === 429 ? "limited" : status === 404 || status === 409 ? "conflict" : "unconfirmed";
}
export function supportDate(value: string, locale: Locale, includeTime = true) {
  const date = new Date(value);
  if (!Number.isFinite(date.valueOf())) return "—";
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", ...(includeTime ? { timeStyle: "short" as const } : {}) }).format(date);
}
