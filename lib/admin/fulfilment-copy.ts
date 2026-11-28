import type { Locale } from "@/lib/i18n";

const messages = {
  shopTitle: ["Customer Shop Orders", "ग्राहक दुकान ऑर्डर", "Customer shop orders"],
  shippingRates: ["Manage international shipping rates", "अंतरराष्ट्रीय डिलीवरी दरें प्रबंधित करें", "International shipping rates manage karein"],
  shopIntro: ["Manage sourcing, packing, dispatch tracking and delivery. Record only genuine changes; a saved status is not independent proof of delivery.", "खरीद, पैकिंग, भेजने की ट्रैकिंग और डिलीवरी प्रबंधित करें। केवल वास्तविक बदलाव दर्ज करें; सहेजी गई स्थिति डिलीवरी का स्वतंत्र प्रमाण नहीं है।", "Sourcing, packing, dispatch tracking aur delivery manage karein. Sirf actual changes record karein; saved status delivery ka independent proof nahi hai."],
  pujaTitle: ["Puja requests & delivery", "पूजा अनुरोध और पूर्ति", "Puja requests aur delivery"],
  pujaIntro: ["Manage private ceremony requests. Obtain the exact Puja's verified Pandit's acceptance and record agreed arrangements before confirming or scheduling.", "निजी पूजा अनुरोध प्रबंधित करें। पुष्टि या समय तय करने से पहले इस पूजा के सत्यापित पंडित की स्वीकृति लें और सहमत व्यवस्था दर्ज करें।", "Private Puja requests manage karein. Confirm ya schedule karne se pehle isi Puja ke verified Pandit ki acceptance lein aur agreed arrangements record karein."],
  consultationTitle: ["Manage Consultations", "परामर्श प्रबंधित करें", "Consultations manage karein"],
  consultationIntro: ["Review schedules, meeting access and recorded transaction status. An administrator's update does not verify a payment or a completed consultation.", "समय, बैठक की सुविधा और दर्ज भुगतान स्थिति देखें। प्रशासक का बदलाव भुगतान या पूरे हुए परामर्श की स्वतंत्र पुष्टि नहीं है।", "Schedules, meeting access aur recorded payment status review karein. Admin update payment ya completed consultation ka independent proof nahi hai."],
  admin: ["Admin Dashboard", "प्रशासक डैशबोर्ड", "Admin dashboard"],
  loading: ["Loading saved records...", "सहेजे गए रिकॉर्ड लोड हो रहे हैं...", "Saved records load ho rahe hain..."],
  refresh: ["Refresh saved records", "सहेजे गए रिकॉर्ड फिर देखें", "Saved records refresh karein"],
  refreshing: ["Refreshing...", "फिर लोड हो रहा है...", "Refresh ho raha hai..."],
  unavailable: ["Saved records could not be verified. Refresh before making a change.", "सहेजे गए रिकॉर्ड की पुष्टि नहीं हुई। बदलाव से पहले फिर लोड करें।", "Saved records verify nahi hue. Change karne se pehle refresh karein."],
  unconfirmed: ["The result could not be confirmed. Refresh the saved record before trying another change.", "परिणाम की पुष्टि नहीं हो सकी। दूसरा बदलाव करने से पहले सहेजा गया रिकॉर्ड फिर लोड करें।", "Result confirm nahi hua. Agla change karne se pehle saved record refresh karein."],
  refreshPage: ["Reload this page to review the saved record before retrying.", "फिर प्रयास करने से पहले सहेजा गया रिकॉर्ड देखने के लिए यह पृष्ठ फिर लोड करें।", "Retry se pehle saved record dekhne ke liye yeh page reload karein."],
  forbidden: ["Use the authorized administrator account, then refresh.", "अधिकृत प्रशासक खाते से प्रवेश करके फिर लोड करें।", "Authorized admin account use karke refresh karein."],
  changed: ["The record changed or a payment is outstanding. Refresh and reconcile its actual state before continuing.", "रिकॉर्ड बदल गया है या भुगतान लंबित है। आगे बढ़ने से पहले फिर लोड करके वास्तविक स्थिति का मिलान करें।", "Record badal gaya hai ya payment outstanding hai. Aage badhne se pehle refresh karke actual state reconcile karein."],
  invalid: ["Check the required fields, allowed next status, confirmed payment and genuine fulfilment evidence.", "आवश्यक जानकारी, अगली अनुमत स्थिति, पुष्ट भुगतान और वास्तविक पूर्ति प्रमाण जाँचें।", "Required fields, allowed next status, confirmed payment aur genuine fulfilment evidence check karein."],
  limited: ["The notification retry limit has been reached. Wait before trying again.", "सूचना दोबारा भेजने की सीमा पूरी हो गई है। फिर प्रयास करने से पहले प्रतीक्षा करें।", "Notification retry limit poori ho gayi hai. Phir try karne se pehle rukein."],
  shopSaved: ["Order update recorded in My Orders.", "ऑर्डर बदलाव मेरे ऑर्डर में दर्ज हो गया है।", "Order update My Orders mein record ho gaya."],
  pujaSaved: ["Puja request update recorded in the customer's account.", "पूजा अनुरोध का बदलाव ग्राहक खाते में दर्ज हो गया है।", "Puja request update customer account mein record ho gaya."],
  consultationSaved: ["Consultation update recorded.", "परामर्श बदलाव दर्ज हो गया है।", "Consultation update record ho gaya."],
  retryRecorded: ["The status notification retry was processed.", "स्थिति सूचना दोबारा भेजने का प्रयास संसाधित हुआ।", "Status notification retry process ho gaya."],
  providerAccepted: ["Email accepted by provider; inbox delivery is not confirmed.", "ईमेल सेवा ने संदेश स्वीकार किया है; inbox तक पहुँचने की पुष्टि नहीं है।", "Email provider ne accept kiya; inbox delivery confirm nahi hai."],
  notificationNotNeeded: ["No status notification was needed.", "स्थिति सूचना की आवश्यकता नहीं थी।", "Status notification ki zaroorat nahi thi."],
  notificationUnconfirmed: ["Customer email delivery was not confirmed. Check the recorded status in the customer's account.", "ग्राहक ईमेल डिलीवरी की पुष्टि नहीं हुई। ग्राहक खाते में दर्ज स्थिति देखें।", "Customer email delivery confirm nahi hui. Customer account ki recorded status dekhein."],
  manage: ["Manage", "प्रबंधित करें", "Manage karein"],
  status: ["Status", "स्थिति", "Status"],
  payment: ["Payment", "भुगतान", "Payment"],
  subtotal: ["Items subtotal", "वस्तुओं का उप-योग", "Items subtotal"],
  total: ["Total", "कुल", "Total"],
  destination: ["Destination", "गंतव्य", "Destination"],
  currentCarrier: ["Current carrier", "वर्तमान परिवहन सेवा", "Current carrier"],
  expires: ["Expires", "मान्य अवधि", "Expiry"],
  na: ["Not applicable", "लागू नहीं", "Laagu nahi"],
  shipping: ["Shipping INR", "डिलीवरी शुल्क INR", "Shipping INR"],
  tax: ["Tax INR", "कर INR", "Tax INR"],
  quote: ["Verified international quote / renewal", "सत्यापित अंतरराष्ट्रीय दर / नवीनीकरण", "Verified international quote / renewal"],
  quoteHelp: ["For missing or expired rates or changed charges, verify the exact products, packaging, serviceability, carrier tariff, tax and customs before confirmation.", "दर उपलब्ध न हो, अवधि समाप्त हो या शुल्क बदले हों तो पुष्टि से पहले सही वस्तु, पैकिंग, सेवा क्षेत्र, परिवहन दर, कर और सीमा शुल्क जाँचें।", "Rate missing ya expired ho ya charges badlein toh confirmation se pehle exact products, packing, serviceability, carrier tariff, tax aur customs verify karein."],
  quoteConsent: ["I verified the actual shipment and approve these shipping and tax amounts.", "मैंने वास्तविक शिपमेंट जाँचा है और इन डिलीवरी व कर राशियों को स्वीकृत करता/करती हूँ।", "Maine actual shipment verify kiya hai aur in shipping aur tax amounts ko approve karta/karti hoon."],
  carrier: ["Carrier / service", "परिवहन सेवा", "Carrier / service"],
  quoteEvidence: ["Carrier quote or evidence reference (private)", "परिवहन दर या प्रमाण संदर्भ (निजी)", "Carrier quote ya evidence reference (private)"],
  quoteExpiry: ["Quote valid until (IST)", "दर कब तक मान्य है (IST)", "Quote kab tak valid hai (IST)"],
  duties: ["Destination import charges", "गंतव्य आयात शुल्क", "Destination import charges"],
  recipientDuties: ["Recipient may pay duties / import tax", "प्राप्तकर्ता को सीमा शुल्क / आयात कर देना पड़ सकता है", "Recipient ko duties / import tax dena pad sakta hai"],
  includedDuties: ["Confirmed included in quote", "दर में शामिल होने की पुष्टि है", "Quote mein included hona confirmed hai"],
  tracking: ["Tracking reference", "ट्रैकिंग संदर्भ", "Tracking reference"],
  supplierEvidence: ["Supplier / dispatch evidence (optional HTTPS URL)", "आपूर्तिकर्ता / भेजने का प्रमाण (वैकल्पिक HTTPS URL)", "Supplier / dispatch evidence (optional HTTPS URL)"],
  shopGuard: ["Verify the exact SKU and dispatch capability. Record shipping and tax before acceptance; only allowed next statuses can be saved.", "सही SKU और भेजने की क्षमता जाँचें। स्वीकृति से पहले डिलीवरी शुल्क व कर दर्ज करें; केवल अनुमत अगली स्थिति सहेजी जा सकती है।", "Exact SKU aur dispatch capability verify karein. Acceptance se pehle shipping aur tax record karein; sirf allowed next status save ho sakti hai."],
  ownerNotes: ["Owner fulfilment notes", "मालिक की पूर्ति टिप्पणी", "Owner fulfilment notes"],
  saveOrder: ["Update order", "ऑर्डर बदलें", "Order update karein"],
  savePuja: ["Update booking", "बुकिंग बदलें", "Booking update karein"],
  save: ["Save changes", "बदलाव सहेजें", "Changes save karein"],
  saving: ["Saving...", "सहेजा जा रहा है...", "Save ho raha hai..."],
  cancel: ["Cancel editing", "संपादन रद्द करें", "Editing cancel karein"],
  pendingCharges: ["Pending shipping and tax", "डिलीवरी शुल्क और कर लंबित हैं", "Shipping aur tax pending hain"],
  items: ["View line items", "वस्तुओं का विवरण देखें", "Line items dekhein"],
  manageOrder: ["Manage order", "ऑर्डर प्रबंधित करें", "Order manage karein"],
  managePuja: ["Manage Puja", "पूजा प्रबंधित करें", "Puja manage karein"],
  retry: ["Retry status email", "स्थिति ईमेल फिर भेजें", "Status email retry karein"],
  retrying: ["Retrying email...", "ईमेल फिर भेजने का प्रयास...", "Email retry ho raha hai..."],
  noOrders: ["No customer order requests yet.", "अभी कोई ग्राहक ऑर्डर अनुरोध नहीं है।", "Abhi koi customer order request nahi hai."],
  noPujas: ["No Puja requests yet.", "अभी कोई पूजा अनुरोध नहीं है।", "Abhi koi Puja request nahi hai."],
  noConsultations: ["No bookings placed yet.", "अभी कोई परामर्श बुकिंग नहीं है।", "Abhi koi consultation booking nahi hai."],
  shortlist: ["Matched Pandit shortlist (up to 10)", "उपयुक्त पंडित सूची (अधिकतम 10)", "Matched Pandit shortlist (10 tak)"],
  choosePandit: ["Select verified Pandit (required for confirmation)", "सत्यापित पंडित चुनें (पुष्टि के लिए आवश्यक)", "Verified Pandit chunein (confirmation ke liye zaroori)"],
  shortlistHelp: ["Only candidates verified for the exact Puja appear, with local matches first. If none accepts, coordination continues. A shortlist does not confirm a booking.", "केवल इसी पूजा के लिए सत्यापित उम्मीदवार दिखते हैं; स्थानीय उम्मीदवार पहले हैं। कोई स्वीकार न करे तो समन्वय जारी रहता है। सूची बुकिंग की पुष्टि नहीं है।", "Sirf exact Puja ke verified candidates dikhte hain; local matches pehle hain. Koi accept na kare toh coordination jaari rahega. Shortlist booking confirmation nahi hai."],
  consentTitle: ["Before changing a confirmed ceremony arrangement", "पुष्ट पूजा व्यवस्था बदलने से पहले", "Confirmed ceremony arrangement badalne se pehle"],
  consentHelp: ["Contact the named verified Pandit and obtain acceptance for this exact Puja. This records your assertion, not an automatic Pandit message.", "नामित सत्यापित पंडित से संपर्क करके इसी पूजा की स्वीकृति लें। यह आपका कथन दर्ज करता है, स्वचालित पंडित संदेश नहीं है।", "Named verified Pandit se contact karke exact Puja ki acceptance lein. Yeh aapka assertion record karta hai, automatic Pandit message nahi."],
  panditConsent: ["I personally confirmed Pandit acceptance and the agreed arrangements.", "मैंने स्वयं पंडित की स्वीकृति और सहमत व्यवस्था की पुष्टि की है।", "Maine khud Pandit acceptance aur agreed arrangements confirm kiye hain."],
  ceremonyTime: ["Confirmed ceremony date/time (ISO, with timezone)", "पुष्ट पूजा तिथि/समय (ISO, समय क्षेत्र सहित)", "Confirmed ceremony date/time (ISO, timezone ke saath)"],
  coordinatorNote: ["Private completion / coordinator note", "निजी पूर्ति / समन्वय टिप्पणी", "Private completion / coordinator note"],
  completionEvidence: ["Real completion evidence HTTPS URL, if applicable", "वास्तविक पूर्ति प्रमाण का HTTPS URL, यदि लागू हो", "Actual completion evidence HTTPS URL, agar laagu ho"],
  devotee: ["Devotee", "भक्त", "Devotee"],
  requestedDate: ["Requested date", "अनुरोधित तिथि", "Requested date"],
  fee: ["Fee", "शुल्क", "Fee"],
  confirmedTime: ["Confirmed time", "पुष्ट समय", "Confirmed time"],
  notScheduled: ["Not scheduled", "समय तय नहीं है", "Schedule nahi hua"],
  coordinator: ["Coordinator", "समन्वयक", "Coordinator"],
  assigned: ["Verified Pandit assigned", "सत्यापित पंडित नियुक्त है", "Verified Pandit assigned"],
  unassigned: ["Pandit not assigned", "पंडित नियुक्त नहीं है", "Pandit assigned nahi hai"],
  sankalp: ["Private Sankalp details", "निजी संकल्प विवरण", "Private Sankalp details"],
  gotra: ["Gotra", "गोत्र", "Gotra"],
  notSupplied: ["Not supplied", "उपलब्ध नहीं कराया", "Diya nahi gaya"],
  email: ["Email", "ईमेल", "Email"],
  mode: ["Mode", "माध्यम", "Mode"],
  mins: ["minutes", "मिनट", "minutes"],
  birth: ["Birth details", "जन्म विवरण", "Birth details"],
  question: ["Question", "प्रश्न", "Question"],
  amount: ["Amount", "राशि", "Amount"],
  bookingStatus: ["Booking status", "बुकिंग स्थिति", "Booking status"],
  paymentStatus: ["Payment status", "भुगतान स्थिति", "Payment status"],
  meeting: ["Meeting link (Zoom / Google Meet)", "बैठक लिंक (Zoom / Google Meet)", "Meeting link (Zoom / Google Meet)"],
  adminNote: ["Private admin note", "निजी प्रशासक टिप्पणी", "Private admin note"],
  unknown: ["Unrecognized status", "अज्ञात स्थिति", "Unknown status"],
  REQUESTED: ["Requested", "अनुरोध प्राप्त", "Request aayi"], CONFIRMED: ["Confirmed", "पुष्ट", "Confirmed"], PACKING: ["Packing", "पैकिंग", "Packing"], DISPATCHED: ["Dispatched", "भेजा गया", "Dispatch hua"], DELIVERED: ["Delivered", "डिलीवर किया गया", "Deliver hua"], CANCELED: ["Canceled", "रद्द", "Canceled"], SCHEDULED: ["Scheduled", "समय तय", "Scheduled"], IN_PROGRESS: ["In progress", "कार्य जारी", "Kaam jaari"], COMPLETED: ["Completed", "पूरा", "Complete"], REJECTED: ["Rejected", "अस्वीकृत", "Rejected"], PENDING: ["Pending", "लंबित", "Pending"], PAYMENT_PENDING: ["Payment pending", "भुगतान लंबित", "Payment pending"], ACCEPTED: ["Accepted", "स्वीकृत", "Accepted"], UNPAID: ["Unpaid", "अवैतनिक", "Unpaid"], PAID: ["Paid", "भुगतान दर्ज", "Paid"], FAILED: ["Failed", "असफल", "Failed"], REFUNDED: ["Refunded", "धनवापसी दर्ज", "Refunded"], ADMIN_BYPASS: ["Admin access without charge", "बिना शुल्क प्रशासक प्रवेश", "Bina charge admin access"], FREE: ["Free", "निःशुल्क", "Free"], VIDEO: ["Video", "वीडियो", "Video"], AUDIO: ["Audio", "ऑडियो", "Audio"], CHAT: ["Chat", "चैट", "Chat"]
} as const;
export type FulfilmentCopyKey = keyof typeof messages;
export function fulfilmentCopy(locale: Locale) {
  const index = locale === "hi" ? 1 : locale === "hinglish" ? 2 : 0;
  return Object.fromEntries(Object.entries(messages).map(([key, value]) => [key, value[index]])) as Record<FulfilmentCopyKey, string>;
}
export function fulfilmentState(value: string, locale: Locale) {
  const copy = fulfilmentCopy(locale);
  return Object.hasOwn(messages, value) ? copy[value as FulfilmentCopyKey] : copy.unknown;
}
export function fulfilmentFailure(status: number): FulfilmentCopyKey {
  return status === 401 || status === 403 ? "forbidden" : status === 404 || status === 409 ? "changed" : status === 422 ? "invalid" : status === 429 ? "limited" : "unconfirmed";
}
export function fulfilmentDate(value: string, locale: Locale, dateOnly = false) {
  const date = new Date(value);
  if (!Number.isFinite(date.valueOf())) return "—";
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {timeZone:"Asia/Kolkata",dateStyle:"medium",...(dateOnly?{}:{timeStyle:"short" as const})}).format(date);
}
export function fulfilmentEmail(outcome: unknown): FulfilmentCopyKey {
  return outcome === "provider_accepted" ? "providerAccepted" : outcome === "not_needed" ? "notificationNotNeeded" : "notificationUnconfirmed";
}
