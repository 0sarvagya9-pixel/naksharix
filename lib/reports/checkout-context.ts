// Fixed-price report purchases and saved-chart unlocks have distinct entitlements.
export type ReportCheckoutContext={reportId:string;savedReportId?:string;reportRequestId?:string};
function record(value:unknown):Record<string,unknown>|null{
 return value!==null&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:null;
}
function absent(value:unknown){return value===null||value===undefined;}
function validId(value:unknown){return typeof value==="string"&&value.trim().length>0;}
export function reportReservationScope(metadata:unknown,context:ReportCheckoutContext){
 const meta=record(metadata);
 if(!meta)return false;
 if(context.savedReportId)return meta.savedReportId===context.savedReportId;
 if(context.reportRequestId)return meta.reportRequestId===context.reportRequestId;
 // An invalid stored reference is not a legitimate independent purchase.
 return meta.reportId===context.reportId&&!validId(meta.savedReportId)&&!validId(meta.reportRequestId);
}
export function matchesReportCheckoutContext(metadata:unknown,context:ReportCheckoutContext){
 const meta=record(metadata);
 if(!meta||meta.reportId!==context.reportId||(context.savedReportId&&context.reportRequestId))return false;
 return (context.savedReportId?meta.savedReportId===context.savedReportId:absent(meta.savedReportId))&&
  (context.reportRequestId?meta.reportRequestId===context.reportRequestId:absent(meta.reportRequestId));
}
export function personalizedPaymentContext(metadata:unknown,existingRequestId?:string){
 const meta=record(metadata);
 return Boolean(meta&&absent(meta.savedReportId)&&(absent(meta.reportRequestId)||(existingRequestId&&meta.reportRequestId===existingRequestId)));
}
export function isPersonalizedPaymentCandidate(metadata:unknown){
 const meta=record(metadata);
 return Boolean(meta&&absent(meta.savedReportId));
}
