/**
 * Plain-language copy for both on-site status and transactional mail.
 * A request acknowledgement is NOT a confirmed ceremony or payment receipt.
 */
export const PUJA_STATUS_NOTICES = {
  REQUESTED: {
    en: "We have received your Puja request. Your preferred date is not reserved, no Pandit has confirmed the ceremony, and no payment is due.",
    hi: "आपकी पूजा की विनती मिल गई है। पसंदीदा तारीख अभी बुक नहीं हुई है, पंडित की पुष्टि बाकी है और कोई भुगतान नहीं करना है।"
  },
  CONFIRMED: {
    en: "Our team has recorded Pandit acceptance. The exact ceremony time still needs scheduling. Please do not pay until the confirmed schedule appears in My Puja Requests.",
    hi: "टीम ने पंडित की सहमति दर्ज की है। पूजा का निश्चित समय तय होना बाकी है। My Puja Requests में समय दिखने तक भुगतान न करें।"
  },
  SCHEDULED: {
    en: "Your Puja time and approved Pandit have been confirmed by our team. Review the date, location and amount in My Puja Requests before paying.",
    hi: "टीम ने पूजा का समय और स्वीकृत पंडित तय कर दिया है। भुगतान से पहले My Puja Requests में तारीख, स्थान और राशि देख लें।"
  },
  IN_PROGRESS: {
    en: "Our team has marked the ceremony as in progress. You can check the current status in your account.",
    hi: "टीम ने पूजा को जारी स्थिति में दर्ज किया है। ताज़ा स्थिति अपने खाते में देखें।"
  },
  COMPLETED: {
    en: "Our team has marked this Puja completed. Review the completion details in your account; contact support if anything is incorrect.",
    hi: "टीम ने पूजा पूरी होने की स्थिति दर्ज की है। अपने खाते में विवरण देखें; कोई गलती हो तो सहायता से संपर्क करें।"
  },
  CANCELED: {
    en: "Your Puja request was canceled. If you paid, review the refund status in your account and contact support for reconciliation.",
    hi: "आपकी पूजा विनती रद्द कर दी गई है। यदि भुगतान किया था तो रिफंड की स्थिति देखें और सहायता से संपर्क करें।"
  },
  REJECTED: {
    en: "We could not accept this Puja request. No new payment is due; please contact support if you need assistance.",
    hi: "हम यह पूजा विनती स्वीकार नहीं कर सके। कोई नया भुगतान न करें; सहायता के लिए संपर्क करें।"
  }
} as const;
export type PujaStatus = keyof typeof PUJA_STATUS_NOTICES;
export function pujaStatusNotice(status: string) {
  return PUJA_STATUS_NOTICES[status as PujaStatus] ?? null;
}
