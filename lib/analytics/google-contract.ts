export const googleConsentKey = "naksharix-google-analytics-consent-v1";
export const googleSessionKey = "naksharix-google-analytics-session-v1";
export const googleSources = ["direct","google","bing","youtube","instagram","facebook","pinterest","whatsapp","email","quora","referral"] as const;
export const googleMedia = ["none","organic","social","email","referral"] as const;
export const reportPurposes = ["KUNDLI_REPORT","YEARLY_REPORT","MATCH_REPORT"] as const;
export type GoogleSource = typeof googleSources[number];
export type GoogleMedium = typeof googleMedia[number];
export type GoogleSession = { client_id: string; session_id: number; source: GoogleSource; medium: GoogleMedium };
export function classifySource(utm: string, referrer: string): {source: GoogleSource;medium: GoogleMedium} {
  const from = (value: string) => {
    const known = value.toLowerCase();
    if (known === "google" || known === "bing") return {source:known,medium:"organic"} as const;
    if (known === "youtube" || known === "instagram" || known === "facebook" || known === "pinterest" || known === "whatsapp" || known === "quora") return {source:known,medium:"social"} as const;
    if (known === "email") return {source:"email",medium:"email"} as const;
    return null;
  };
  const campaign = from(utm);
  if (campaign) return campaign;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host === "naksharix.com" || host.endsWith(".naksharix.com")) return {source:"direct",medium:"none"};
    for (const [domain, source] of [["google.com","google"],["google.co.in","google"],["bing.com","bing"],["youtube.com","youtube"],["youtu.be","youtube"],["instagram.com","instagram"],["facebook.com","facebook"],["fb.com","facebook"],["pinterest.com","pinterest"],["whatsapp.com","whatsapp"],["quora.com","quora"]] as const) {
      if (host === domain || host.endsWith("."+domain)) return from(source)!;
    }
    return {source:"referral",medium:"referral"};
  } catch { return {source:"direct",medium:"none"}; }
}
export function isLiveReportPurchase(payment: {status:string;provider:string;purpose:string;amount:unknown;currency:string;providerPaymentId?:string|null;metadata?:unknown}, liveRuntime: boolean): boolean {
  const meta = payment.metadata && typeof payment.metadata === "object" ? payment.metadata as Record<string,unknown> : {};
  const amount = Number(payment.amount);
  return liveRuntime && payment.status === "PAID" && payment.provider === "RAZORPAY" &&
    reportPurposes.some(p=>p===payment.purpose) && Boolean(payment.providerPaymentId) &&
    meta.analyticsLiveOrder === true && meta.gatewayStatus === "captured" &&
    Number.isFinite(amount) && amount > 0 && amount <= 10000000 && payment.currency === "INR";
}
export function publicEventParams(session:GoogleSession, route:string) {
  return {session_id:session.session_id,engagement_time_msec:1,source:session.source,medium:session.medium,
    page_location:"https://www.naksharix.com"+route.replace(":public-page","public-page"),page_title:"Naksharix public page"};
}
export function commerceParams(session:GoogleSession, value:number, transactionId?:string) {
  return {session_id:session.session_id,engagement_time_msec:1,source:session.source,medium:session.medium,
    page_location:"https://www.naksharix.com/reports",page_title:"Naksharix digital reports",currency:"INR",value,
    ...(transactionId?{transaction_id:transactionId}:{}),
    items:[{item_id:"digital-report",item_name:"Digital astrology report",item_category:"Digital report",price:value,quantity:1}]};
}
