export const MEMBERSHIP_TERMS_VERSION="ai-monthly-membership-v1";
export type MembershipOffer={version:string;planId:string;pricePaise:number;unitsPerCycle:number;totalCycles:number;approvedModel:string};
const safeInt=(value:unknown,min:number,max:number):value is number=>typeof value==="number"&&Number.isSafeInteger(value)&&value>=min&&value<=max;
const id=(v:unknown,prefix:string)=>typeof v==="string"&&new RegExp("^"+prefix+"_[A-Za-z0-9]{5,80}$").test(v);
export function membershipOffer(input:{enabled:boolean;planId?:string;version?:string;price?:string;units?:string;cycles?:string;approvedModel?:string;activeModel:string}):MembershipOffer|null{
 if(!input.enabled||!id(input.planId,"plan")||!input.version||!/^[a-z0-9][a-z0-9-]{0,63}$/.test(input.version)||!input.approvedModel||input.approvedModel!==input.activeModel||![input.price,input.units,input.cycles].every(x=>typeof x==="string"&&/^\d+$/.test(x)))return null;
 const pricePaise=Number(input.price),unitsPerCycle=Number(input.units),totalCycles=Number(input.cycles);
 if(!safeInt(pricePaise,100,1000000)||!safeInt(unitsPerCycle,1,500)||!safeInt(totalCycles,2,12))return null;
 return {version:input.version,planId:input.planId!,pricePaise,unitsPerCycle,totalCycles,approvedModel:input.approvedModel};
}
export function sameMembershipOffer(a:MembershipOffer,b:MembershipOffer){return a.version===b.version&&a.planId===b.planId&&a.pricePaise===b.pricePaise&&a.unitsPerCycle===b.unitsPerCycle&&a.totalCycles===b.totalCycles&&a.approvedModel===b.approvedModel;}
export function exactMonthlyPlan(value:unknown,offer:MembershipOffer){
 if(!value||typeof value!=="object")return false;const p=value as {id?:unknown;period?:unknown;interval?:unknown;item?:{amount?:unknown;currency?:unknown}};
 return p.id===offer.planId&&p.period==="monthly"&&p.interval===1&&p.item?.amount===offer.pricePaise&&p.item.currency==="INR";
}
export function safeSubscriptionLink(value:unknown){
 if(typeof value!=="string"||value.length>300)return null;
 try{const u=new URL(value);return u.protocol==="https:"&&u.hostname==="rzp.io"&&!u.port&&!u.username&&!u.password&&!u.search&&!u.hash&&/^\/(?:i|rzp)\/[A-Za-z0-9_-]{3,120}$/.test(u.pathname)?u.href:null;}catch{return null;}
}
export const terminalMembershipStates=["CANCELED","COMPLETED","EXPIRED"] as const;
export function mappedMembershipState(providerState:unknown,cancelRequested:boolean){
 if(providerState==="cancelled")return "CANCELED";
 if(providerState==="completed")return "COMPLETED";
 if(providerState==="expired")return "EXPIRED";
 if(cancelRequested)return "CANCEL_PENDING";
 if(providerState==="created"||providerState==="authenticated")return "AWAITING_AUTHORIZATION";
 if(providerState==="active")return "ACTIVE";
 if(providerState==="pending")return "PENDING";
 if(providerState==="halted"||providerState==="paused")return "HALTED";
 return "REVIEW";
}
export type CycleEvidence={subscriptionId:string;cycleNumber:number;periodStart:Date;periodEnd:Date;paymentId:string;orderId:string;invoiceId:string};
export function readChargeEvidence(subscription:unknown,payment:unknown,offer:MembershipOffer,expectedId:string,nowSeconds:number):CycleEvidence|null{
 if(!subscription||typeof subscription!=="object"||!payment||typeof payment!=="object"||!Number.isFinite(nowSeconds))return null;
 const s=subscription as Record<string,unknown>,p=payment as Record<string,unknown>;
 if(s.id!==expectedId||!id(s.id,"sub")||s.plan_id!==offer.planId||s.quantity!==1||s.total_count!==offer.totalCycles||!safeInt(s.paid_count,1,offer.totalCycles)||!["active","completed","cancelled"].includes(String(s.status)))return null;
 if(s.offer_id!==null&&s.offer_id!==undefined)return null;
 if(!safeInt(s.current_start,946684800,4102444800)||!safeInt(s.current_end,946684800,4102444800)||s.current_start>nowSeconds+300||s.current_end-s.current_start<27*86400||s.current_end-s.current_start>32*86400)return null;
 if(!id(p.id,"pay")||!id(p.order_id,"order")||!id(p.invoice_id,"inv")||p.status!=="captured"||p.amount!==offer.pricePaise||p.currency!=="INR"||p.amount_refunded!==0)return null;
 return {subscriptionId:s.id as string,cycleNumber:s.paid_count,periodStart:new Date(s.current_start*1000),periodEnd:new Date(s.current_end*1000),paymentId:p.id as string,orderId:p.order_id as string,invoiceId:p.invoice_id as string};
}
export function freshChargeMatches(value:unknown,evidence:CycleEvidence,pricePaise:number){
 if(!value||typeof value!=="object")return false;const p=value as Record<string,unknown>;
 return p.id===evidence.paymentId&&p.order_id===evidence.orderId&&p.invoice_id===evidence.invoiceId&&p.status==="captured"&&p.amount===pricePaise&&p.currency==="INR"&&safeInt(p.amount_refunded,0,pricePaise);
}
