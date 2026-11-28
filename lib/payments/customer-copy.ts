import type {Locale} from "@/lib/i18n";
import {selectCopy, type LocalizedCopy} from "@/lib/i18n-copy";

const dictionary = {
  pay: ["Pay with Razorpay", "Razorpay से भुगतान करें", "Razorpay se payment karein"],
  processing: ["Processing…", "प्रक्रिया जारी है…", "Process ho raha hai…"],
  creating: ["Creating a secure payment order…", "सुरक्षित भुगतान आदेश बनाया जा रहा है…", "Secure payment order ban raha hai…"],
  signIn: ["Sign in to your account before starting payment.", "भुगतान शुरू करने से पहले अपने खाते में साइन इन करें।", "Payment shuru karne se pehle apne account mein sign in karein."],
  signInTitle: ["Sign in required", "साइन इन करना आवश्यक है", "Sign in zaroori hai"],
  accountUnverified: ["Unable to verify your account. No payment checkout was started. Please sign in or try again.", "आपके खाते की पुष्टि नहीं हो सकी। भुगतान प्रक्रिया शुरू नहीं हुई। साइन इन करें या फिर प्रयास करें।", "Account verify nahi hua. Payment checkout shuru nahi hua. Sign in karein ya dobara try karein."],
  admin: ["Admin testing mode: payment was bypassed.", "व्यवस्थापक परीक्षण मोड: भुगतान नहीं लिया गया।", "Admin testing mode: payment nahi liya gaya."],
  adminNotice: ["Admin mode skipped a charge. No payment has been collected.", "व्यवस्थापक मोड में शुल्क नहीं लिया गया। कोई भुगतान प्राप्त नहीं हुआ है।", "Admin mode mein charge skip hua. Koi payment collect nahi hua."],
  adminTitle: ["Admin testing mode", "व्यवस्थापक परीक्षण मोड", "Admin testing mode"],
  eligibleAccount: ["This purchase requires an eligible customer account and verified payment.", "इस खरीद के लिए पात्र ग्राहक खाता और सत्यापित भुगतान आवश्यक है।", "Is purchase ke liye eligible customer account aur verified payment zaroori hai."],
  unavailable: ["Secure payment checkout is unavailable. Please try later.", "सुरक्षित भुगतान पेज अभी उपलब्ध नहीं है। बाद में प्रयास करें।", "Secure payment checkout abhi available nahi hai. Baad mein try karein."],
  unavailableTitle: ["Payment unavailable", "भुगतान उपलब्ध नहीं", "Payment available nahi"],
  pending: ["Payment status needs confirmation. Check Payment History before retrying; do not pay twice.", "भुगतान की स्थिति की पुष्टि बाकी है। दोबारा प्रयास करने से पहले भुगतान इतिहास देखें; दोहरा भुगतान न करें।", "Payment status ki confirmation baaki hai. Dobara try karne se pehle Payment History dekhein; do baar payment na karein."],
  networkPending: ["Unable to reach the payment server. Check Payment History before retrying; do not pay twice.", "भुगतान सर्वर से संपर्क नहीं हो सका। दोबारा प्रयास करने से पहले भुगतान इतिहास देखें; दोहरा भुगतान न करें।", "Payment server se connection nahi hua. Dobara try karne se pehle Payment History dekhein; do baar payment na karein."],
  verifying: ["Verifying payment…", "भुगतान सत्यापित किया जा रहा है…", "Payment verify ho raha hai…"],
  verified: ["Payment verified.", "भुगतान सत्यापित है।", "Payment verify ho gaya hai."],
  verifiedNotice: ["Your payment has been verified. Check the booking/order history for fulfilment status.", "आपका भुगतान सत्यापित है। सेवा या डिलीवरी की स्थिति के लिए बुकिंग या आदेश इतिहास देखें।", "Payment verify ho gaya hai. Service ya delivery status ke liye booking ya order history dekhein."],
  verifiedTitle: ["Payment verified", "भुगतान सत्यापित", "Payment verify hua"],
  verifiedReview: ["Payment is verified. Review Payment History and the purchased service before retrying; do not pay again.", "भुगतान सत्यापित है। दोबारा प्रयास करने से पहले भुगतान इतिहास और खरीदी गई सेवा देखें; फिर भुगतान न करें।", "Payment verified hai. Dobara try karne se pehle Payment History aur purchased service dekhein; phir payment na karein."],
  confirmationPending: ["Payment confirmation is pending. Check your payment history before trying again; do not pay twice.", "भुगतान की पुष्टि बाकी है। फिर प्रयास करने से पहले भुगतान इतिहास देखें; दोहरा भुगतान न करें।", "Payment confirmation pending hai. Phir try karne se pehle Payment History dekhein; do baar payment na karein."],
  confirmationUnchecked: ["Payment confirmation could not be checked. Check payment history before trying again; do not pay twice.", "भुगतान की पुष्टि जाँची नहीं जा सकी। फिर प्रयास करने से पहले भुगतान इतिहास देखें; दोहरा भुगतान न करें।", "Payment confirmation check nahi ho saki. Phir try karne se pehle Payment History dekhein; do baar payment na karein."],
  closed: ["Checkout closed. If money was deducted, verify payment history before retrying.", "भुगतान पेज बंद हुआ। यदि पैसे कटे हैं तो दोबारा प्रयास करने से पहले भुगतान इतिहास जाँचें।", "Checkout band hua. Agar paise kate hain to dobara try karne se pehle Payment History check karein."],
  closedTitle: ["Checkout closed", "भुगतान पेज बंद हुआ", "Checkout band hua"],
  failed: ["Payment was not confirmed. Check Payment History before retrying; do not pay twice.", "भुगतान की पुष्टि नहीं हुई। दोबारा प्रयास करने से पहले भुगतान इतिहास देखें; दोहरा भुगतान न करें।", "Payment confirm nahi hua. Dobara try karne se pehle Payment History dekhein; do baar payment na karein."],
  checkoutUnavailable: ["Could not open checkout. Review payment history before trying again.", "भुगतान पेज नहीं खुल सका। फिर प्रयास करने से पहले भुगतान इतिहास देखें।", "Checkout nahi khul saka. Phir try karne se pehle Payment History dekhein."],
  checkoutUnavailableTitle: ["Checkout unavailable", "भुगतान पेज उपलब्ध नहीं", "Checkout available nahi"],
  invalidDetails: ["Review the selected item and required details before checkout. Check Payment History if you have already paid.", "भुगतान से पहले चुनी गई वस्तु या सेवा और आवश्यक विवरण जाँचें। पहले भुगतान किया है तो भुगतान इतिहास देखें।", "Checkout se pehle selected item aur required details check karein. Pehle payment ki hai to Payment History dekhein."],
  itemUnavailable: ["This checkout item is unavailable. Review your saved purchase or contact support.", "यह वस्तु या सेवा अभी भुगतान के लिए उपलब्ध नहीं है। सुरक्षित खरीद विवरण देखें या सहायता से संपर्क करें।", "Yeh checkout item available nahi hai. Saved purchase dekhein ya support se contact karein."],
  tooMany: ["Too many attempts. Check existing payment history and try later.", "बहुत अधिक प्रयास हुए हैं। मौजूदा भुगतान इतिहास जाँचें और बाद में प्रयास करें।", "Bahut zyada attempts hue hain. Existing Payment History check karke baad mein try karein."],
  feeTitle: ["Important payment information", "भुगतान की आवश्यक जानकारी", "Payment ki zaroori jaankari"],
  feeDialog: ["Important Puja payment information", "पूजा भुगतान की आवश्यक जानकारी", "Puja payment ki zaroori jaankari"],
  feeAmount: ["₹1,100 platform coordination fee", "₹1,100 प्लेटफ़ॉर्म समन्वय शुल्क", "₹1,100 platform coordination fee"],
  refundPolicy: ["Read refund policy", "धनवापसी नीति पढ़ें", "Refund policy padhein"],
  acceptFee: ["I have read and accept the platform fee and availability terms.", "मैंने प्लेटफ़ॉर्म शुल्क और उपलब्धता की शर्तें पढ़ी हैं और स्वीकार करता/करती हूँ।", "Maine platform fee aur availability terms padhi hain aur unhein accept karta/karti hoon."],
  cancel: ["Cancel", "रद्द करें", "Cancel karein"],
  agreePay: ["Agree & proceed to pay ₹1,100", "सहमत हूँ, ₹1,100 भुगतान करें", "Sahmat hoon, ₹1,100 payment karein"],
  history: ["Payment History", "भुगतान इतिहास", "Payment History"],
  loading: ["Loading payments…", "भुगतान विवरण लोड हो रहे हैं…", "Payment details load ho rahi hain…"],
  empty: ["No payments yet.", "अभी कोई भुगतान नहीं है।", "Abhi koi payment nahi hai."],
  loadFailed: ["Payment history could not be loaded. Refresh before making another payment.", "भुगतान इतिहास लोड नहीं हो सका। दूसरा भुगतान करने से पहले पेज ताज़ा करें।", "Payment History load nahi hui. Doosri payment karne se pehle refresh karein."],
  resume: ["Review / resume existing payment", "मौजूदा भुगतान देखें या जारी रखें", "Existing payment dekhein ya resume karein"],
  completeReport: ["Complete purchased report details", "खरीदी गई रिपोर्ट के विवरण पूरे करें", "Purchased report ki details poori karein"],
  reportStatus: ["View report status", "रिपोर्ट की स्थिति देखें", "Report status dekhein"],
  membership: ["Manage membership and cancellation", "सदस्यता और रद्द करने के विकल्प देखें", "Membership aur cancellation manage karein"],
  expert: ["Review expert service", "विशेषज्ञ सेवा देखें", "Expert service dekhein"],
  packages: ["Open package orders", "पैकेज के आदेश देखें", "Package orders dekhein"],
  credits: ["Review AI credit balance or existing purchase", "AI क्रेडिट शेष या मौजूदा खरीद देखें", "AI credit balance ya existing purchase dekhein"],
  receipt: ["Payment receipt", "भुगतान रसीद", "Payment receipt"],
  verifiedPayment: ["Verified payment", "सत्यापित भुगतान", "Verified payment"],
  submitReport: ["Submit Report Details", "रिपोर्ट के विवरण जमा करें", "Report details submit karein"],
  paymentRecorded: ["Your payment is recorded as verified.", "आपका भुगतान रिकॉर्ड में सत्यापित है।", "Aapka payment record mein verified hai."],
  reportNext: ["Complete the purchased report details, then check the report status after submission.", "खरीदी गई रिपोर्ट के विवरण पूरे करें, फिर उन्हें जमा करने के बाद रिपोर्ट की स्थिति देखें।", "Purchased report ki details poori karein, phir submit karne ke baad report status dekhein."],
  linkedReportNext: ["A report request is linked to this payment. Open its status for processing and delivery updates.", "इस भुगतान से एक रिपोर्ट अनुरोध जुड़ा है। प्रक्रिया और डिलीवरी की जानकारी के लिए उसकी स्थिति देखें।", "Is payment se ek report request linked hai. Processing aur delivery updates ke liye uska status dekhein."],
  purchaseNext: ["Open your dashboard to review the purchased service and Payment History.", "खरीदी गई सेवा और भुगतान इतिहास देखने के लिए अपना डैशबोर्ड खोलें।", "Purchased service aur Payment History dekhne ke liye apna dashboard kholein."],
  adminNoPayment: ["This is no-charge admin access. This page does not create a payment or a report request.", "यह बिना शुल्क वाला व्यवस्थापक प्रवेश है। इस पेज से भुगतान या रिपोर्ट अनुरोध नहीं बनता।", "Yeh bina charge wala admin access hai. Is page se payment ya report request create nahi hoti."],
  adminNext: ["Open your dashboard to continue.", "आगे बढ़ने के लिए अपना डैशबोर्ड खोलें।", "Aage badhne ke liye apna dashboard kholein."]
} satisfies Record<string, LocalizedCopy>;

export type PaymentMessage = keyof typeof dictionary;
export const paymentCopy = (locale: Locale) => selectCopy(dictionary, locale);

export function paymentOrderMessage(status: number): PaymentMessage {
  if (status === 401) return "signIn";
  if (status === 403) return "eligibleAccount";
  if (status === 404) return "itemUnavailable";
  if (status === 422) return "invalidDetails";
  if (status === 429) return "tooMany";
  return "unavailable";
}

const statuses = {
  PENDING: ["Pending", "बाकी", "Pending"], PAID: ["Paid", "भुगतान प्राप्त", "Payment received"],
  FAILED: ["Failed", "असफल", "Failed"], REFUNDED: ["Refunded", "धनवापसी हुई", "Refund ho gaya"],
  ADMIN_BYPASS: ["Admin payment bypass", "व्यवस्थापक द्वारा भुगतान छूट", "Admin payment bypass"], FREE: ["Free", "निःशुल्क", "Free"]
} satisfies Record<string, LocalizedCopy>;
const purposes = {
  SUBSCRIPTION: ["Subscription", "सदस्यता", "Subscription"], KUNDLI_REPORT: ["Kundli report", "कुंडली रिपोर्ट", "Kundli report"],
  YEARLY_REPORT: ["Yearly report", "वार्षिक रिपोर्ट", "Yearly report"], MATCH_REPORT: ["Matching report", "मिलान रिपोर्ट", "Matching report"],
  CONSULTATION: ["Consultation", "परामर्श", "Consultation"], PUJA_BOOKING: ["Puja booking", "पूजा बुकिंग", "Puja booking"],
  SHOP_ORDER: ["Shop order", "दुकान का आदेश", "Shop order"], WALLET_TOPUP: ["Wallet top-up", "वॉलेट में राशि जोड़ना", "Wallet top-up"],
  AI_CREDITS: ["AI response credits", "AI उत्तर क्रेडिट", "AI response credits"], DIGITAL_PACKAGE: ["Digital package", "डिजिटल पैकेज", "Digital package"],
  EXPERT_SERVICE: ["Expert service", "विशेषज्ञ सेवा", "Expert service"], AI_MEMBERSHIP: ["AI membership", "AI सदस्यता", "AI membership"]
} satisfies Record<string, LocalizedCopy>;
export function paymentStatusLabel(value: string, locale: Locale) { return Object.hasOwn(statuses,value) ? selectCopy(statuses, locale)[value as keyof typeof statuses] : value; }
export function paymentPurposeLabel(value: string, locale: Locale) { return Object.hasOwn(purposes,value) ? selectCopy(purposes, locale)[value as keyof typeof purposes] : value; }
