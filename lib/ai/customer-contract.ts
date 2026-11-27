import {validCreditIntent,type CreditOffer} from "@/lib/ai/credit-contract";
import type {MembershipOffer} from "@/lib/ai/membership-contract";

const record=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==="object"&&!Array.isArray(value);
const text=(value:unknown,max=100):value is string=>typeof value==="string"&&!!value.trim()&&value.length<=max;
const integer=(value:unknown,min=0,max=Number.MAX_SAFE_INTEGER):value is number=>typeof value==="number"&&Number.isSafeInteger(value)&&value>=min&&value<=max;
const date=(value:unknown):value is string=>typeof value==="string"&&Number.isFinite(Date.parse(value));
export function readCreditOffer(value:unknown):CreditOffer|null{
 if(!record(value)||!text(value.version,64)||!/^[a-z0-9][a-z0-9-]{0,63}$/.test(value.version)||!integer(value.units,1,500)||!integer(value.pricePaise,100,1000000))return null;
 return {version:value.version,units:value.units,pricePaise:value.pricePaise};
}
export type CreditSummary={enabled:false;offer:null}|{enabled:true;offer:CreditOffer|null;remaining:number;unresolvedPurchase:boolean;pendingIntent:string|null;pendingOffer:CreditOffer|null};
export function readCreditSummary(value:unknown):CreditSummary|null{
 if(!record(value))return null;
 if(value.enabled===false&&value.offer===null)return {enabled:false,offer:null};
 if(value.enabled!==true||!integer(value.remaining)||typeof value.unresolvedPurchase!=="boolean"||!(value.pendingIntent===null||validCreditIntent(value.pendingIntent)))return null;
 const offer=value.offer===null?null:readCreditOffer(value.offer),pendingOffer=value.pendingOffer===null?null:readCreditOffer(value.pendingOffer);
 if(value.offer!==null&&!offer||value.pendingOffer!==null&&!pendingOffer||!value.unresolvedPurchase&&(value.pendingIntent!==null||pendingOffer!==null))return null;
 return {enabled:true,offer,remaining:value.remaining,unresolvedPurchase:value.unresolvedPurchase,pendingIntent:value.pendingIntent as string|null,pendingOffer};
}
export function readMembershipOffer(value:unknown):MembershipOffer|null{
 if(!record(value)||!text(value.version,64)||!/^[a-z0-9][a-z0-9-]{0,63}$/.test(value.version)||!text(value.planId)||!/^plan_[A-Za-z0-9]{5,80}$/.test(value.planId)||!integer(value.pricePaise,100,1000000)||!integer(value.unitsPerCycle,1,500)||!integer(value.totalCycles,2,12)||!text(value.approvedModel,120))return null;
 return {version:value.version,planId:value.planId,pricePaise:value.pricePaise,unitsPerCycle:value.unitsPerCycle,totalCycles:value.totalCycles,approvedModel:value.approvedModel};
}
export const membershipStates=["CREATING","AWAITING_AUTHORIZATION","ACTIVE","PENDING","HALTED","REVIEW","CANCEL_PENDING","CANCELED","COMPLETED","EXPIRED"] as const;
export type MembershipRecord={id:string;version:string;state:typeof membershipStates[number];providerState:string|null;pricePaise:number;unitsPerCycle:number;totalCycles:number;authorizationUrl:string|null;canCancel:boolean};
export type MembershipCycle={cycleNumber:number;periodStart:string;periodEnd:string;paymentStatus:string;availableUnits:number};
export type MembershipRow=MembershipRecord&{cycles:MembershipCycle[]};
export function readMembershipRecord(value:unknown):MembershipRecord|null{
 if(!record(value)||!text(value.id)||!text(value.version,64)||!membershipStates.includes(value.state as MembershipRecord["state"])||!(value.providerState===null||text(value.providerState,40))||!integer(value.pricePaise,100,1000000)||!integer(value.unitsPerCycle,1,500)||!integer(value.totalCycles,2,12)||!(value.authorizationUrl===null||typeof value.authorizationUrl==="string")||typeof value.canCancel!=="boolean")return null;
 return {id:value.id,version:value.version,state:value.state as MembershipRecord["state"],providerState:value.providerState as string|null,pricePaise:value.pricePaise,unitsPerCycle:value.unitsPerCycle,totalCycles:value.totalCycles,authorizationUrl:value.authorizationUrl as string|null,canCancel:value.canCancel};
}
function readCycle(value:unknown):MembershipCycle|null{
 if(!record(value)||!integer(value.cycleNumber,1,12)||!date(value.periodStart)||!date(value.periodEnd)||Date.parse(value.periodEnd)<=Date.parse(value.periodStart)||!["PENDING","PAID","FAILED","REFUNDED","ADMIN_BYPASS","FREE"].includes(String(value.paymentStatus))||!integer(value.availableUnits,0,500))return null;
 return {cycleNumber:value.cycleNumber,periodStart:value.periodStart,periodEnd:value.periodEnd,paymentStatus:value.paymentStatus as string,availableUnits:value.availableUnits};
}
export function readMembershipAccount(value:unknown):{offer:MembershipOffer|null;memberships:MembershipRow[]}|null{
 if(!record(value)||!Array.isArray(value.memberships)||value.memberships.length>12)return null;
 const offer=value.offer===null?null:readMembershipOffer(value.offer);if(value.offer!==null&&!offer)return null;
 const memberships:MembershipRow[]=[];
 for(const candidate of value.memberships){const row=readMembershipRecord(candidate);if(!row||!record(candidate)||!Array.isArray(candidate.cycles)||candidate.cycles.length>12)return null;const cycles=candidate.cycles.map(readCycle);if(cycles.some(c=>!c)||new Set(cycles.map(c=>c!.cycleNumber)).size!==cycles.length)return null;memberships.push({...row,cycles:cycles as MembershipCycle[]});}
 if(new Set(memberships.map(row=>row.id)).size!==memberships.length)return null;
 return {offer,memberships};
}
export function membershipMatchesOffer(row:MembershipRecord,offer:Pick<MembershipOffer,"version"|"pricePaise"|"unitsPerCycle"|"totalCycles">){return row.version===offer.version&&row.pricePaise===offer.pricePaise&&row.unitsPerCycle===offer.unitsPerCycle&&row.totalCycles===offer.totalCycles;}
