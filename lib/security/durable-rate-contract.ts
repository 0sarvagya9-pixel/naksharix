/** Shared rolling-window counter contract. No raw client identity is persisted. */
export const MAX_DURABLE_RATE_TTL_SECONDS=86400;
export function validDurableRateInput(key:string,ttlSeconds:number){
 return typeof key==="string"&&key.length>0&&key.length<=512&&Number.isSafeInteger(ttlSeconds)&&ttlSeconds>=1&&ttlSeconds<=MAX_DURABLE_RATE_TTL_SECONDS;
}
export function durableRateDecision(count:number,resetAt:number,limit:number,now:number){
 if(!Number.isSafeInteger(count)||count<1||!Number.isSafeInteger(resetAt)||resetAt<1||!Number.isSafeInteger(limit)||limit<1||!Number.isFinite(now))throw new Error("RATE_COUNTER_INVALID");
 return {allowed:count<=limit,count,remaining:Math.max(0,limit-count),retryAfterSeconds:Math.max(1,Math.ceil((resetAt-now)/1000))};
}
