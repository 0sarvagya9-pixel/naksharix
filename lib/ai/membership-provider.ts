import "server-only";
import {env} from "@/lib/env";
import {getRazorpayReadiness} from "@/lib/payments/readiness";
import {exactMonthlyPlan,type MembershipOffer} from "@/lib/ai/membership-contract";
/** Fixed official API origin and bounded IDs; never accept a request URL from a customer. */
async function merchantRequest(path:string,method:"GET"|"POST",body?:Record<string,unknown>){
 if(!getRazorpayReadiness().enabled||!env.RAZORPAY_KEY_ID||!env.RAZORPAY_KEY_SECRET)throw Error("MEMBERSHIP_MERCHANT_UNAVAILABLE");
 if(!/^\/(?:plans\/plan_[A-Za-z0-9]{5,80}|subscriptions(?:\/sub_[A-Za-z0-9]{5,80}(?:\/cancel)?)?|payments\/pay_[A-Za-z0-9]{5,80})$/.test(path))throw Error("MEMBERSHIP_PROVIDER_PATH_INVALID");
 const r=await fetch("https://api.razorpay.com/v1"+path,{method,headers:{Authorization:"Basic "+Buffer.from(env.RAZORPAY_KEY_ID+":"+env.RAZORPAY_KEY_SECRET).toString("base64"),"Content-Type":"application/json"},...(body?{body:JSON.stringify(body)}:{}),redirect:"error",cache:"no-store",signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Error("MEMBERSHIP_PROVIDER_REQUEST_UNCONFIRMED");
 const value:unknown=await r.json();if(!value||typeof value!=="object"||Array.isArray(value))throw Error("MEMBERSHIP_PROVIDER_RESPONSE_INVALID");return value as Record<string,unknown>;
}
export async function checkApprovedPlan(offer:MembershipOffer){return exactMonthlyPlan(await merchantRequest("/plans/"+offer.planId,"GET"),offer);}
export async function createProviderMembership(localId:string,offer:MembershipOffer){
 return merchantRequest("/subscriptions","POST",{plan_id:offer.planId,quantity:1,total_count:offer.totalCycles,customer_notify:1,expire_by:Math.floor(Date.now()/1000)+24*3600,notes:{naksharix_membership_id:localId,naksharix_membership_version:offer.version}});
}
export async function fetchProviderMembership(id:string){return merchantRequest("/subscriptions/"+id,"GET");}
export async function cancelProviderMembership(id:string){return merchantRequest("/subscriptions/"+id+"/cancel","POST",{cancel_at_cycle_end:false});}
export async function fetchMembershipPayment(id:string){return merchantRequest("/payments/"+id,"GET");}
