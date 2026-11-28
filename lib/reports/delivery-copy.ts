import type {Locale} from "@/lib/i18n";
import {selectCopy, type LocalizedCopy} from "@/lib/i18n-copy";

const dictionary = {
  sent: ["Your report is ready and the email has been accepted by the delivery provider. If it is not in your inbox, use the secure download below.", "आपकी रिपोर्ट तैयार है और ईमेल सेवा ने संदेश स्वीकार किया है। इनबॉक्स में न मिले तो नीचे दिए सुरक्षित डाउनलोड का उपयोग करें।", "Report ready hai aur email provider ne message accept kiya hai. Inbox mein na mile to neeche secure download use karein."],
  ready: ["Your report PDF is ready. Email delivery is pending; you can download it securely now.", "आपकी रिपोर्ट PDF तैयार है। ईमेल डिलीवरी बाकी है; अभी सुरक्षित डाउनलोड कर सकते हैं।", "Report PDF ready hai. Email delivery pending hai; abhi secure download kar sakte hain."],
  paidReview: ["Payment is verified and linked to this request. The request is in the paid review queue.", "भुगतान सत्यापित है और इस अनुरोध से जुड़ा है। अनुरोध सशुल्क समीक्षा की कतार में है।", "Payment verified hai aur is request se linked hai. Request paid review queue mein hai."],
  reconciliation: ["Payment evidence requires reconciliation. Do not pay again; contact support with your existing request reference.", "भुगतान के प्रमाण का मिलान आवश्यक है। दोबारा भुगतान न करें; मौजूदा अनुरोध संदर्भ के साथ सहायता से संपर्क करें।", "Payment evidence reconcile karna zaroori hai. Dobara payment na karein; existing request reference ke saath support se contact karein."],
  refunded: ["This purchase has been refunded. Paid PDF access is no longer available.", "इस खरीद की धनवापसी हो चुकी है। सशुल्क PDF का उपयोग अब उपलब्ध नहीं है।", "Is purchase ka refund ho chuka hai. Paid PDF access ab available nahi hai."],
  manual: ["This is a manual-review request. No payment has been collected. The team will confirm scope and fee before any checkout is enabled.", "यह मानवीय समीक्षा का अनुरोध है। कोई भुगतान नहीं लिया गया है। भुगतान उपलब्ध करने से पहले टीम काम का दायरा और शुल्क बताएगी।", "Yeh manual review request hai. Koi payment collect nahi hua. Checkout enable karne se pehle team scope aur fee confirm karegi."],
  download: ["Download private PDF", "निजी PDF डाउनलोड करें", "Private PDF download karein"],
  downloadPending: ["A download option will appear only after a real PDF has been generated.", "PDF बन जाने के बाद ही डाउनलोड का विकल्प दिखेगा।", "PDF generate hone ke baad hi download option dikhega."],
  deliveryReview: ["Automatic processing needs review. Your purchase is saved; check the report status or contact care@naksharix.com. Do not pay again.", "स्वचालित प्रक्रिया की समीक्षा आवश्यक है। आपकी खरीद सुरक्षित है; रिपोर्ट की स्थिति देखें या care@naksharix.com से संपर्क करें। दोबारा भुगतान न करें।", "Automatic processing ko review chahiye. Purchase saved hai; report status dekhein ya care@naksharix.com se contact karein. Dobara payment na karein."],
  emailUncertain: ["The email provider response is uncertain. Use the secure download if available, or contact support. Do not pay again.", "ईमेल सेवा का उत्तर स्पष्ट नहीं है। उपलब्ध हो तो सुरक्षित डाउनलोड करें, अन्यथा सहायता से संपर्क करें। दोबारा भुगतान न करें।", "Email provider ka response clear nahi hai. Available ho to secure download use karein, ya support se contact karein. Dobara payment na karein."],
  verifyEmail: ["Verify your registered account email to receive the report link. If delivery is delayed, contact care@naksharix.com with your request reference. No additional payment is needed.", "रिपोर्ट का लिंक पाने के लिए खाते का पंजीकृत ईमेल सत्यापित करें। देरी हो तो अनुरोध संदर्भ के साथ care@naksharix.com से संपर्क करें। अतिरिक्त भुगतान आवश्यक नहीं है।", "Report link paane ke liye registered account email verify karein. Delay ho to request reference ke saath care@naksharix.com se contact karein. Extra payment zaroori nahi hai."],
  reference: ["Request reference", "अनुरोध संदर्भ", "Request reference"],
  email: ["Request email", "अनुरोध का ईमेल", "Request email"],
  readings: ["View My Readings", "मेरे पठन देखें", "Meri readings dekhein"],
  browse: ["Browse Reports", "रिपोर्ट देखें", "Reports dekhein"],
  refreshing: ["This page refreshes the report status while you are here. You may safely close it.", "यह पेज खुला रहने पर रिपोर्ट की स्थिति ताज़ा करता है। आप इसे सुरक्षित रूप से बंद कर सकते हैं।", "Yeh page khula rehne par report status refresh karta hai. Aap ise safely close kar sakte hain."],
  retry: ["Retry automatic delivery", "स्वचालित डिलीवरी का फिर प्रयास करें", "Automatic delivery dobara try karein"],
  processing: ["Processing…", "प्रक्रिया जारी है…", "Process ho raha hai…"],
  queued: ["Processing request recorded. Check the report status below.", "प्रक्रिया का अनुरोध दर्ज हुआ। नीचे रिपोर्ट की स्थिति देखें।", "Processing request record ho gayi. Neeche report status dekhein."],
  retryUnavailable: ["Retry unavailable; contact care@naksharix.com.", "दोबारा प्रयास अभी उपलब्ध नहीं है; care@naksharix.com से संपर्क करें।", "Retry abhi available nahi hai; care@naksharix.com se contact karein."],
  retryConnection: ["Unable to request retry. Your purchase remains saved.", "दोबारा प्रयास का अनुरोध नहीं हो सका। आपकी खरीद सुरक्षित है।", "Retry request nahi ho saki. Purchase saved hai."],
  retrySignIn: ["Sign in to the account that purchased this report before retrying.", "फिर प्रयास करने से पहले रिपोर्ट खरीदने वाले खाते में साइन इन करें।", "Retry se pehle report purchase karne wale account mein sign in karein."],
  retryPaused: ["Automatic processing is currently paused. Your purchase remains saved.", "स्वचालित प्रक्रिया अभी रुकी है। आपकी खरीद सुरक्षित है।", "Automatic processing abhi paused hai. Purchase saved hai."],
  retryNotEligible: ["This report is not eligible for automatic retry. Review its current status or contact support.", "इस रिपोर्ट पर स्वचालित पुनः प्रयास उपलब्ध नहीं है। वर्तमान स्थिति देखें या सहायता से संपर्क करें।", "Is report par automatic retry available nahi hai. Current status dekhein ya support se contact karein."],
  retryLimited: ["Too many retry requests. Wait before trying again; no additional payment is needed.", "बहुत अधिक पुनः प्रयास हुए हैं। फिर प्रयास करने से पहले रुकें; अतिरिक्त भुगतान आवश्यक नहीं है।", "Bahut zyada retry requests hui hain. Dobara try karne se pehle wait karein; extra payment zaroori nahi hai."]
} satisfies Record<string, LocalizedCopy>;
export const reportDeliveryCopy = (locale: Locale) => selectCopy(dictionary, locale);
export type ReportDeliveryMessage = keyof typeof dictionary;
export function reportRetryMessage(status: number): ReportDeliveryMessage {
  if (status === 401 || status === 403) return "retrySignIn";
  if (status === 409) return "retryNotEligible";
  if (status === 429) return "retryLimited";
  if (status === 503) return "retryPaused";
  return "retryUnavailable";
}
