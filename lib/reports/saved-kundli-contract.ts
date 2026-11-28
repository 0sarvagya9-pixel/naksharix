// Saved Kundli unlock is a separate product entitlement, not a generic
// report-purpose flag. Preserve legacy free charts without granting paid access.
export const SAVED_KUNDLI_SKU="kundli-pro";
export function isSavedKundliCheckout(purpose:string,reportId:string){
 return purpose==="KUNDLI_REPORT"&&reportId===SAVED_KUNDLI_SKU;
}
function record(value:unknown):Record<string,unknown>|null{
 return value!==null&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:null;
}
export function unwrapSavedKundliReport(value:unknown){
 const outer=record(value);
 if(!outer)return null;
 return record(outer.reportJson??outer.report??outer.data)??outer;
}
export function hasSavedKundliPayload(value:unknown){
 const report=unwrapSavedKundliReport(value);
 return Boolean(report&&record(report.profile)&&record(report.birthDetails));
}
export type SavedKundliPayment={
 userId:string;provider:string;purpose:string;status:string;currency:string;
 amount:unknown;providerPaymentId:string|null;metadata:unknown
};
export function matchesSavedKundliPayment(payment:SavedKundliPayment,userId:string,savedReportId:string,amount:number){
 const meta=record(payment.metadata);
 return payment.userId===userId&&payment.provider==="RAZORPAY"&&payment.status==="PAID"&&
  isSavedKundliCheckout(payment.purpose,typeof meta?.reportId==="string"?meta.reportId:"")&&
  payment.currency==="INR"&&Number(payment.amount)===amount&&Number.isFinite(amount)&&amount>0&&
  typeof payment.providerPaymentId==="string"&&/^pay_[A-Za-z0-9]{5,80}$/.test(payment.providerPaymentId)&&
  meta?.savedReportId===savedReportId&&(meta.reportRequestId===undefined||meta.reportRequestId===null)&&meta.gatewayStatus==="captured";
}
