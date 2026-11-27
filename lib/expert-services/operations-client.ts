import type {ExpertKind} from "@/lib/expert-services/contract";
export type ExpertRow={id:string;kind:ExpertKind;question:string|null;language:string;status:string;quoteVersion:number;pricePaise:number|null;expertFeePaise:number|null;dueAt:string|null;settlementStatus:string};
export type ExpertProviderRow=ExpertRow&{response:string|null;sourceReviewed:boolean;canReadReport:boolean};
export type ExpertAdminRow=ExpertRow&{paymentId:string|null;settlementReference:string|null;astrologerProfile:{id:string;displayName:string}|null};
const record=(v:unknown):v is Record<string,unknown>=>Boolean(v)&&typeof v==="object"&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==="string"&&v.trim().length>0;
const nullableText=(v:unknown)=>v===null||text(v);
const money=(v:unknown)=>v===null||Number.isSafeInteger(v)&&Number(v)>=0;
const statuses=["REQUESTED","ASSIGNED","QUOTED","PAYMENT_PENDING","PAID","DELIVERED","REVIEW","REFUNDED","CANCELED"];
function row(v:unknown):v is ExpertRow&Record<string,unknown>{return record(v)&&text(v.id)&&["WRITTEN","REPORT_REVIEW"].includes(String(v.kind))&&nullableText(v.question)&&["en","hi","hinglish"].includes(String(v.language))&&statuses.includes(String(v.status))&&Number.isSafeInteger(v.quoteVersion)&&Number(v.quoteVersion)>=0&&money(v.pricePaise)&&money(v.expertFeePaise)&&(v.dueAt===null||text(v.dueAt)&&Number.isFinite(Date.parse(v.dueAt)))&&text(v.settlementStatus);}
export function readExpertProviderRows(value:unknown):ExpertProviderRow[]|null{
 if(!record(value)||!Array.isArray(value.requests)||!value.requests.every(v=>row(v)&&record(v)&&nullableText(v.response)&&typeof v.sourceReviewed==="boolean"&&typeof v.canReadReport==="boolean"))return null;
 if(new Set(value.requests.map(v=>v.id)).size!==value.requests.length)return null;
 return value.requests as ExpertProviderRow[];
}
export function readExpertAdmin(value:unknown):{intake:boolean;requests:ExpertAdminRow[];profiles:{id:string;displayName:string}[]}|null{
 if(!record(value)||typeof value.intake!=="boolean"||!Array.isArray(value.requests)||!Array.isArray(value.profiles))return null;
 const profile=(p:unknown)=>record(p)&&text(p.id)&&text(p.displayName);
 if(!value.profiles.every(profile)||!value.requests.every(v=>row(v)&&record(v)&&nullableText(v.paymentId)&&nullableText(v.settlementReference)&&(v.astrologerProfile===null||profile(v.astrologerProfile))))return null;
 if(new Set(value.requests.map(v=>v.id)).size!==value.requests.length||new Set(value.profiles.map(v=>v.id)).size!==value.profiles.length)return null;
 return value as {intake:boolean;requests:ExpertAdminRow[];profiles:{id:string;displayName:string}[]};
}
export function expertActionRecorded(value:unknown,id:unknown,action:unknown):boolean{return record(value)&&value.saved===true&&value.id===id&&value.action===action&&text(id)&&text(action);}
export function expertConsentKey(row:Pick<ExpertRow,"id"|"kind"|"language"|"quoteVersion"|"pricePaise"|"dueAt">&{expertFeePaise?:number|null;astrologerProfile?:{id:string}|null}){return JSON.stringify([row.id,row.kind,row.language,row.quoteVersion,row.pricePaise,row.expertFeePaise??null,row.dueAt,row.astrologerProfile?.id??null]);}

export type ExpertCustomerRow=Omit<ExpertRow,"expertFeePaise"|"settlementStatus">&{question:string;response:string|null;astrologerProfile:{id:string;displayName:string}|null};
export function readExpertCustomer(value:unknown):{intake:boolean;sales:boolean;requests:ExpertCustomerRow[];reports:{id:string;reportSlug:string;createdAt:string}[]}|null{
 if(!record(value)||typeof value.intake!=="boolean"||typeof value.sales!=="boolean"||!Array.isArray(value.requests)||!Array.isArray(value.reports))return null;
 if(!value.requests.every(v=>record(v)&&row({...v,expertFeePaise:null,settlementStatus:"NOT_EARNED"})&&text(v.question)&&nullableText(v.response)&&(v.astrologerProfile===null||record(v.astrologerProfile)&&text(v.astrologerProfile.id)&&text(v.astrologerProfile.displayName))))return null;
 if(!value.reports.every(v=>record(v)&&text(v.id)&&text(v.reportSlug)&&text(v.createdAt)&&Number.isFinite(Date.parse(v.createdAt)))||new Set(value.requests.map(v=>v.id)).size!==value.requests.length)return null;
 return value as {intake:boolean;sales:boolean;requests:ExpertCustomerRow[];reports:{id:string;reportSlug:string;createdAt:string}[]};
}
export function expertRequestRecorded(value:unknown,input:Record<string,unknown>):boolean{return record(value)&&text(value.id)&&statuses.includes(String(value.status))&&value.clientIntent===input.clientIntent&&value.kind===input.kind&&value.question===String(input.question).trim()&&value.language===input.language&&value.sourceReportId===(input.sourceReportId??null);}
