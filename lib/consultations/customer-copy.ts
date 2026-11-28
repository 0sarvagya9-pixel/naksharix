import type { Locale } from "@/lib/i18n";
import { CONSULTATION_TIME_ZONE } from "@/lib/consultations/slot-time";

const messages = {
  dashboard: ["User Dashboard", "आपका खाता", "Aapka dashboard"],
  bookingsTitle: ["My Bookings", "मेरी बुकिंग", "Meri bookings"],
  bookingsDescription: ["Track your consultation schedule, meeting links and payment status.", "अपने परामर्श का समय, बैठक की कड़ी और भुगतान की स्थिति देखें।", "Apne consultation ka samay, meeting link aur payment ki sthiti dekhein."],
  signInBookings: ["Please sign in to view your bookings.", "अपनी बुकिंग देखने के लिए कृपया प्रवेश करें।", "Apni bookings dekhne ke liye sign in karein."],
  signIn: ["Sign in", "प्रवेश करें", "Sign in karein"],
  yourSessions: ["Your sessions", "आपके सत्र", "Aapke sessions"],
  historyTitle: ["Consultation History", "परामर्श का इतिहास", "Pichhle consultations"],
  historyDescription: ["View your consultations and review completed sessions.", "अपने परामर्श देखें और पूरे हो चुके सत्रों की समीक्षा लिखें।", "Apne consultations dekhein aur poore ho chuke sessions ka review likhein."],
  signInHistory: ["Please sign in to view consultation history.", "परामर्श का इतिहास देखने के लिए कृपया प्रवेश करें।", "Consultation history dekhne ke liye sign in karein."],
  confirmedTitle: ["Your consultation is scheduled", "आपके परामर्श का समय तय है", "Aapke consultation ka samay tay hai"],
  acceptedTitle: ["Your consultation request has been accepted", "आपका परामर्श अनुरोध स्वीकार हो गया है", "Aapki consultation request sweekar ho gayi hai"],
  receivedTitle: ["Your booking request has been received", "आपका बुकिंग अनुरोध मिल गया है", "Aapki booking request mil gayi hai"],
  completedTitle: ["Your consultation is complete", "आपका परामर्श पूरा हो गया है", "Aapka consultation poora ho gaya hai"],
  closedTitle: ["Your consultation booking has been closed", "आपकी परामर्श बुकिंग बंद हो गई है", "Aapki consultation booking band ho gayi hai"],
  confirmedBody: ["Your consultation is scheduled for {time}. Check your dashboard for the assigned meeting link.", "आपके परामर्श का समय {time} है। बैठक की कड़ी के लिए अपना खाता देखें।", "Aapke consultation ka samay {time} hai. Meeting link ke liye apna dashboard dekhein."],
  pendingBody: ["Your slot request is saved. Please check your dashboard for updates or to complete pending payments.", "आपके चुने हुए समय का अनुरोध दर्ज है। नई जानकारी और लंबित भुगतान के लिए अपना खाता देखें।", "Aapke chune hue samay ki request darj hai. Updates aur pending payment ke liye apna dashboard dekhein."],
  paidAwaitingApproval: ["Payment has been received. Your booking still awaits confirmation from the astrologer. Check your dashboard for updates.", "भुगतान मिल गया है। आपकी बुकिंग पर ज्योतिषी की पुष्टि अभी बाकी है। नई जानकारी के लिए अपना खाता देखें।", "Payment mil gaya hai. Aapki booking par astrologer ki pushti abhi baaki hai. Updates ke liye apna dashboard dekhein."],
  paymentCheck: ["Check the payment status below and your dashboard before joining the session.", "सत्र में जुड़ने से पहले नीचे दी गई भुगतान स्थिति और अपना खाता देखें।", "Session join karne se pehle neeche payment ki sthiti aur apna dashboard dekhein."],
  completedBody: ["You can view this session and leave a review in your bookings.", "आप अपनी बुकिंग में यह सत्र देख सकते हैं और समीक्षा लिख सकते हैं।", "Apni bookings mein yeh session dekhein aur review likhein."],
  closedBody: ["This consultation is not scheduled. Review the booking and payment status below, or contact support for help.", "यह परामर्श तय नहीं है। नीचे बुकिंग और भुगतान की स्थिति देखें या सहायता के लिए संपर्क करें।", "Yeh consultation tay nahi hai. Neeche booking aur payment ki sthiti dekhein ya support se madad lein."],
  astrologer: ["Astrologer", "ज्योतिषी", "Astrologer"],
  dateTime: ["Date & time", "दिनांक और समय", "Tareekh aur samay"],
  minutes: ["minutes", "मिनट", "minute"],
  timeZone: ["IST", "भारतीय समय", "IST"],
  booking: ["Booking", "बुकिंग", "Booking"],
  bookingStatus: ["Booking status", "बुकिंग की स्थिति", "Booking ki sthiti"],
  payment: ["Payment", "भुगतान", "Payment"],
  paymentStatus: ["Payment status", "भुगतान की स्थिति", "Payment ki sthiti"],
  contactEmail: ["Contact email", "संपर्क ईमेल", "Sampark email"],
  joinSession: ["Join session", "सत्र में जुड़ें", "Session join karein"],
  joinExternal: ["Join external consultation room", "बाहरी परामर्श कक्ष में जुड़ें", "External consultation room join karein"],
  meetingAssigned: ["Your astrologer has assigned an external meeting room.", "आपके ज्योतिषी ने बाहरी बैठक कक्ष की कड़ी दी है।", "Aapke astrologer ne external meeting room ka link diya hai."],
  meetingPrivacy: ["The meeting is hosted by a third party. Confirm the time and privacy controls with your astrologer.", "बैठक किसी अन्य सेवा पर होगी। अपने ज्योतिषी से समय और गोपनीयता की व्यवस्था की पुष्टि कर लें।", "Meeting ek third-party service par hogi. Apne astrologer se samay aur privacy controls ki pushti kar lein."],
  meetingPending: ["No external meeting link has been assigned yet. Check again before the scheduled session.", "बाहरी बैठक की कड़ी अभी नहीं दी गई है। सत्र के तय समय से पहले फिर देखें।", "External meeting link abhi nahi diya gaya hai. Session ke tay samay se pehle phir dekhein."],
  adminBypass: ["Admin testing mode — payment was bypassed.", "प्रशासक के परीक्षण में भुगतान को छोड़ा गया था।", "Admin testing mein payment bypass kiya gaya tha."],
  myBookings: ["Go to my bookings", "मेरी बुकिंग देखें", "Meri bookings dekhein"],
  backAstrologers: ["Back to astrologers", "ज्योतिषियों की सूची पर जाएँ", "Astrologers ki list par jaayen"],
  support: ["Need help? Contact support at", "सहायता के लिए संपर्क करें:", "Madad ke liye support se sampark karein:"],
  birthDetails: ["Birth details submitted", "दिया गया जन्म विवरण", "Di gayi janm jaankari"],
  name: ["Name", "नाम", "Naam"],
  dateOfBirth: ["Date of birth", "जन्म तिथि", "Janm tareekh"],
  time: ["Time", "समय", "Samay"],
  place: ["Place", "स्थान", "Sthaan"],
  yourQuestion: ["Your question", "आपका प्रश्न", "Aapka sawaal"],
  leaveReview: ["Leave a review", "समीक्षा लिखें", "Review likhein"],
  rated: ["You rated this session {rating}/5 stars", "आपने इस सत्र को 5 में से {rating} सितारे दिए", "Aapne is session ko 5 mein se {rating} stars diye"],
  pendingPayment: ["Payment is pending. Please complete checkout to secure your slot.", "भुगतान लंबित है। अपना समय सुरक्षित करने के लिए भुगतान प्रक्रिया पूरी करें।", "Payment baaki hai. Apna slot secure karne ke liye checkout poora karein."],
  empty: ["No consultation bookings yet.", "अभी कोई परामर्श बुकिंग नहीं है।", "Abhi koi consultation booking nahi hai."],
  rateConsultation: ["Rate your consultation", "अपने परामर्श को अंक दें", "Apne consultation ko rating dein"],
  ratingGroup: ["Choose a rating from one to five stars", "एक से पाँच सितारों में अंक चुनें", "Ek se paanch stars mein rating chunein"],
  star: ["star", "सितारा", "sitara"],
  stars: ["stars", "सितारे", "sitare"],
  feedbackLabel: ["Optional feedback about your consultation", "परामर्श के बारे में वैकल्पिक प्रतिक्रिया", "Consultation ke baare mein optional feedback"],
  feedbackPlaceholder: ["Optional: share your consultation experience...", "चाहें तो परामर्श का अपना अनुभव लिखें…", "Chahein to consultation ka apna anubhav likhein…"],
  saving: ["Saving rating...", "अंक सहेजे जा रहे हैं…", "Rating save ho rahi hai…"],
  submitRating: ["Submit rating", "अंक जमा करें", "Rating jama karein"],
  reviewSaved: ["Your consultation rating has been saved.", "आपके परामर्श के अंक सहेज लिए गए हैं।", "Aapke consultation ki rating save ho gayi hai."],
  reviewUnconfirmed: ["We could not confirm that your rating was saved. Check your bookings before trying again.", "आपके अंक सहेजे जाने की पुष्टि नहीं हो सकी। फिर प्रयास करने से पहले अपनी बुकिंग देखें।", "Aapki rating save hone ki pushti nahi ho saki. Phir koshish karne se pehle apni bookings dekhein."],
  reviewFailed: ["Could not save rating. Please try again.", "अंक सहेजे नहीं जा सके। कृपया फिर प्रयास करें।", "Rating save nahi ho paayi. Kripya phir koshish karein."],
  reviewSignIn: ["Please sign in to review a consultation.", "परामर्श की समीक्षा के लिए कृपया प्रवेश करें।", "Consultation ka review dene ke liye sign in karein."],
  reviewNotFound: ["This booking could not be found. Check your bookings before trying again.", "यह बुकिंग नहीं मिली। फिर प्रयास करने से पहले अपनी बुकिंग देखें।", "Yeh booking nahi mili. Phir koshish karne se pehle apni bookings dekhein."],
  reviewNotCompleted: ["You can review a consultation after it is completed.", "परामर्श पूरा होने के बाद आप समीक्षा दे सकते हैं।", "Consultation poora hone ke baad aap review de sakte hain."],
  reviewInvalid: ["Choose a rating from 1 to 5 and keep feedback within 800 characters.", "1 से 5 के बीच अंक चुनें और प्रतिक्रिया 800 अक्षरों के भीतर रखें।", "1 se 5 ke beech rating chunein aur feedback 800 characters tak rakhein."],
  reviewRefresh: ["Refresh this page and try submitting your review again.", "यह पृष्ठ फिर खोलें और समीक्षा दोबारा जमा करें।", "Yeh page refresh karein aur review dobara jama karein."],
  reviewLimited: ["Please wait a moment before submitting another review.", "अगली समीक्षा जमा करने से पहले थोड़ी देर प्रतीक्षा करें।", "Agla review jama karne se pehle thodi der rukein."],
  statusUnknown: ["Status unavailable", "स्थिति उपलब्ध नहीं है", "Sthiti uplabdh nahi hai"],
  pending: ["Pending", "लंबित", "Lambit"],
  requested: ["Requested", "अनुरोध भेजा गया", "Request bheji gayi"],
  paymentPending: ["Payment pending", "भुगतान लंबित", "Payment baaki hai"],
  accepted: ["Accepted", "स्वीकार किया गया", "Sweekar kiya gaya"],
  confirmed: ["Confirmed", "पुष्टि हो गई", "Pushti ho gayi"],
  rejected: ["Rejected", "अस्वीकार किया गया", "Asweekar kiya gaya"],
  completed: ["Completed", "पूरा हुआ", "Poora hua"],
  canceled: ["Canceled", "रद्द किया गया", "Radd kiya gaya"],
  paid: ["Paid", "भुगतान हो गया", "Payment ho gaya"],
  failed: ["Failed", "असफल", "Asafal"],
  refunded: ["Refunded", "राशि लौटाई गई", "Raashi lautayi gayi"],
  free: ["Free", "निःशुल्क", "Nishulk"],
  bypass: ["Admin test bypass", "प्रशासक का परीक्षण अपवाद", "Admin test bypass"],
  chat: ["Chat session", "चैट सत्र", "Chat session"],
  audio: ["Audio session", "ऑडियो सत्र", "Audio session"],
  video: ["Video session", "वीडियो सत्र", "Video session"]
} as const;

type CopyKey = keyof typeof messages;
export function consultationCustomerCopy(locale: Locale) {
  const index = locale === "hi" ? 1 : locale === "hinglish" ? 2 : 0;
  return Object.fromEntries(Object.entries(messages).map(([key, values]) => [key, values[index]])) as Record<CopyKey, string>;
}

const bookingLabels: Record<string, CopyKey> = {
  PENDING: "pending", REQUESTED: "requested", PAYMENT_PENDING: "paymentPending", ACCEPTED: "accepted",
  CONFIRMED: "confirmed", REJECTED: "rejected", COMPLETED: "completed", CANCELED: "canceled"
};
const paymentLabels: Record<string, CopyKey> = {
  PENDING: "pending", PAID: "paid", FAILED: "failed", REFUNDED: "refunded", FREE: "free", ADMIN_BYPASS: "bypass"
};
export function consultationStatusLabel(status: string, locale: Locale) {
  return consultationCustomerCopy(locale)[bookingLabels[status] ?? "statusUnknown"];
}
export function consultationPaymentLabel(status: string, locale: Locale) {
  return consultationCustomerCopy(locale)[paymentLabels[status] ?? "statusUnknown"];
}
export function consultationModeLabel(mode: string, locale: Locale) {
  const key = ({ CHAT: "chat", AUDIO: "audio", VIDEO: "video" } as const)[mode as "CHAT" | "AUDIO" | "VIDEO"];
  return consultationCustomerCopy(locale)[key ?? "statusUnknown"];
}
export function customerConsultationTime(date: Date, locale: Locale) {
  return `${new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "full", timeStyle: "short", timeZone: CONSULTATION_TIME_ZONE
  }).format(date)} (${consultationCustomerCopy(locale).timeZone})`;
}
export function consultationReviewError(status: number, error: unknown, locale: Locale) {
  const copy = consultationCustomerCopy(locale);
  if (status >= 200 && status < 300) return copy.reviewUnconfirmed;
  if (status === 401) return copy.reviewSignIn;
  if (status === 403) return copy.reviewRefresh;
  if (status === 404) return copy.reviewNotFound;
  if (status === 429) return copy.reviewLimited;
  if (status === 422) return error === "Reviews are available after a completed consultation" ? copy.reviewNotCompleted : copy.reviewInvalid;
  return copy.reviewFailed;
}
