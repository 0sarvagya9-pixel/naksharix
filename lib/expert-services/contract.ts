export const EXPERT_TERMS_VERSION="expert-service-v1";
export const expertKinds=["WRITTEN","REPORT_REVIEW"] as const;
export type ExpertKind=typeof expertKinds[number];
export const expertNames={WRITTEN:"Written astrologer consultation",REPORT_REVIEW:"Human-reviewed report add-on"} as const;
export function validExpertQuote(pricePaise:number,expertFeePaise:number,dueAt:number,now:number){
 return Number.isSafeInteger(pricePaise)&&pricePaise>=100&&pricePaise<=10000000&&Number.isSafeInteger(expertFeePaise)&&expertFeePaise>0&&expertFeePaise<=pricePaise&&Number.isFinite(dueAt)&&Number.isFinite(now)&&dueAt>=now+3600000&&dueAt<=now+30*86400000;
}
export function exactExpertPayment(order:{id:string;userId:string;kind:string;paymentId:string|null;quoteVersion:number;pricePaise:number|null;astrologerProfileId:string|null;consentVersion:string},payment:{id:string;userId:string;purpose:string;provider:string;currency:string;amount:unknown;metadata:unknown}){
 const m=payment.metadata&&typeof payment.metadata==="object"&&!Array.isArray(payment.metadata)?payment.metadata as Record<string,unknown>:{};
 return !!order.paymentId&&order.paymentId===payment.id&&order.userId===payment.userId&&order.pricePaise!==null&&order.consentVersion===EXPERT_TERMS_VERSION&&payment.purpose==="EXPERT_SERVICE"&&payment.provider==="RAZORPAY"&&payment.currency==="INR"&&Math.round(Number(payment.amount)*100)===order.pricePaise&&m.expertServiceId===order.id&&m.expertKind===order.kind&&m.expertQuoteVersion===order.quoteVersion&&m.expertPricePaise===order.pricePaise&&m.expertProfileId===order.astrologerProfileId&&m.expertTermsVersion===EXPERT_TERMS_VERSION;
}
export function expertEntitled(order:Parameters<typeof exactExpertPayment>[0]&{status:string},payment:(Parameters<typeof exactExpertPayment>[1]&{status:string;providerPaymentId:string|null})|null){
 const m=payment?.metadata as Record<string,unknown>|null|undefined;
 return !!payment&&["PAID","DELIVERED"].includes(order.status)&&payment.status==="PAID"&&Boolean(payment.providerPaymentId)&&m?.gatewayStatus==="captured"&&exactExpertPayment(order,payment);
}
export function sourceMatches(kind:string,expected:string|null,current:string|null){
 return kind==="WRITTEN"||(kind==="REPORT_REVIEW"&&typeof expected==="string"&&/^[a-f0-9]{64}$/.test(expected)&&expected===current);
}
export const expertStatusLabels:Record<string,string>={REQUESTED:"Awaiting assignment",ASSIGNED:"Awaiting practitioner acceptance",QUOTED:"Practitioner accepted — review quote",PAYMENT_PENDING:"Payment requires verification",PAID:"Paid — awaiting written response",DELIVERED:"Practitioner response available",REVIEW:"Support / merchant review required",REFUNDED:"Refunded",CANCELED:"Canceled"};

/** A purchased review does not override revocation of its underlying report. */
export function expertProviderAccess(kind:string,status:string,entitled:boolean,sourceValid:boolean){
 const validKind=kind==="WRITTEN"||kind==="REPORT_REVIEW";
 const active=validKind&&sourceValid;
 return {
  question:active&&(["ASSIGNED","QUOTED","PAYMENT_PENDING"].includes(status)||(entitled&&["PAID","DELIVERED"].includes(status))),
  response:active&&entitled&&status==="DELIVERED",
  report:active&&entitled&&kind==="REPORT_REVIEW"&&status==="PAID",
  reviewed:active&&entitled&&kind==="REPORT_REVIEW"&&["PAID","DELIVERED"].includes(status)
 };
}
