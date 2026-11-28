/** One credit purchases one completed response. No monetary wallet balance or automatic renewal. */
export const AI_CREDIT_TERMS_VERSION="ai-credit-response-v1";
export type CreditOffer={version:string;units:number;pricePaise:number};
export type CreditPackSnapshot=CreditOffer&{intent:string;termsVersion:typeof AI_CREDIT_TERMS_VERSION};
export function validCreditIntent(value:unknown):value is string {
 return typeof value==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
function isOffer(value:unknown):value is CreditOffer{
 if(!value||typeof value!=="object")return false;
 const o=value as CreditOffer;
 return typeof o.version==="string"&&/^[a-z0-9][a-z0-9-]{0,63}$/.test(o.version)&&Number.isSafeInteger(o.units)&&o.units>=1&&o.units<=500&&Number.isSafeInteger(o.pricePaise)&&o.pricePaise>=100&&o.pricePaise<=1000000;
}
export function approvedCreditOffer(input:{enabled:boolean;version?:string;units?:string;pricePaise?:string;approvedModel?:string;activeModel:string}):CreditOffer|null{
 if(!input.enabled||!input.approvedModel||input.approvedModel!==input.activeModel||!/^\d+$/.test(input.units??"")||!/^\d+$/.test(input.pricePaise??""))return null;
 const offer={version:input.version,units:Number(input.units),pricePaise:Number(input.pricePaise)};
 return isOffer(offer)?offer:null;
}
export function creditSnapshot(metadata:unknown,amountPaise:number,currency:string):CreditPackSnapshot|null{
 if(!metadata||typeof metadata!=="object"||currency!=="INR")return null;
 const m=metadata as Record<string,unknown>,o=m.aiCreditPack as CreditPackSnapshot|undefined;
 if(!isOffer(o)||!validCreditIntent(o.intent)||m.aiCreditIntent!==o.intent||o.termsVersion!==AI_CREDIT_TERMS_VERSION||o.pricePaise!==amountPaise)return null;
 return o;
}
export function offerMatches(a:CreditOffer,b:CreditOffer){return a.version===b.version&&a.pricePaise===b.pricePaise&&a.units===b.units;}
