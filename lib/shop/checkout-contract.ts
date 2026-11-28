import type {ShippingSnapshot} from "./shipping-rules";
export type CheckoutQuote={kind:"PUBLISHED_RATE"|"QUOTE_REQUIRED";subtotalPaise:number;shippingPaise:number|null;taxPaise:number|null;totalPaise:number|null;carrier:string|null;dutiesMode:"INCLUDED"|"RECIPIENT_MAY_PAY"|null;expiresAt:string|null;quoteKey:string};
export type CartLine={productId:string;quantity:number};
const obj=(v:unknown):Record<string,unknown>|null=>v!==null&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:null;
const amount=(v:unknown):v is number=>typeof v==="number"&&Number.isSafeInteger(v)&&v>=0&&v<=1_000_000_000;
const nonempty=(v:unknown,max:number):v is string=>typeof v==="string"&&v.trim().length>0&&v.length<=max;
const date=(v:unknown):v is string=>typeof v==="string"&&Number.isFinite(Date.parse(v));
const duties=(v:unknown):v is "INCLUDED"|"RECIPIENT_MAY_PAY"=>v==="INCLUDED"||v==="RECIPIENT_MAY_PAY";
export function normalizeCartLines(value:unknown):CartLine[]{
 if(!Array.isArray(value))return [];
 const map=new Map<string,number>();
 for(const input of value){
  const line=obj(input);
  if(!line||typeof line.productId!=="string"||!/^[a-zA-Z0-9-]{1,128}$/.test(line.productId)||typeof line.quantity!=="number"||!Number.isSafeInteger(line.quantity)||line.quantity<1||line.quantity>10)continue;
  if(!map.has(line.productId)&&map.size>=20)continue;
  map.set(line.productId,Math.min(10,(map.get(line.productId)??0)+line.quantity));
 }
 return Array.from(map,([productId,quantity])=>({productId,quantity}));
}
export function cartFingerprint(lines:CartLine[]):string{
 return JSON.stringify(normalizeCartLines(lines).sort((a,b)=>a.productId.localeCompare(b.productId)));
}
export function readCheckoutQuote(value:unknown,subtotal:number,now=Date.now()):CheckoutQuote|null{
 const q=obj(value);
 if(!q||!amount(subtotal)||subtotal<100||q.subtotalPaise!==subtotal||typeof q.quoteKey!=="string"||!/^[a-f0-9]{64}$/.test(q.quoteKey)||!Number.isFinite(now))return null;
 if(q.kind==="QUOTE_REQUIRED"){
  if(q.shippingPaise!==null||q.taxPaise!==null||q.totalPaise!==null||q.carrier!==null||q.dutiesMode!==null||q.expiresAt!==null)return null;
 }else if(q.kind==="PUBLISHED_RATE"){
  if(!amount(q.shippingPaise)||!amount(q.taxPaise)||!amount(q.totalPaise)||q.totalPaise!==subtotal+q.shippingPaise+q.taxPaise||!nonempty(q.carrier,4096)||!duties(q.dutiesMode)||!date(q.expiresAt)||Date.parse(q.expiresAt)<=now)return null;
 }else return null;
 return q as CheckoutQuote;
}
export function quoteStillCurrent(quote:CheckoutQuote|null,now=Date.now()):boolean{
 return !!quote&&!!readCheckoutQuote(quote,quote.subtotalPaise,now);
}
type ExpectedOrder={country:string;postalCode:string;subtotalPaise:number;quote:CheckoutQuote|null};
export type CheckoutOrder={id:string;status:"REQUESTED"|"CONFIRMED";paymentStatus:"UNPAID";subtotalPaise:number;shippingPaise:number|null;taxPaise:number|null;totalPaise:number|null;deliveryCountry:string;shippingQuote:ShippingSnapshot|null;version:number};
export function readCheckoutOrder(value:unknown,expected:ExpectedOrder):{order:CheckoutOrder;onlineCheckoutAvailable:boolean}|null{
 const result=obj(value),data=obj(result?.data),order=obj(data?.order);
 if(!data||!order||data.charged!==false||typeof data.onlineCheckoutAvailable!=="boolean"||!nonempty(order.id,128)||!/^[a-zA-Z0-9_-]+$/.test(order.id)||order.paymentStatus!=="UNPAID"||(order.status!=="REQUESTED"&&order.status!=="CONFIRMED")||order.deliveryCountry!==expected.country||!amount(expected.subtotalPaise)||expected.subtotalPaise<100||order.subtotalPaise!==expected.subtotalPaise||typeof order.version!=="number"||!Number.isSafeInteger(order.version)||order.version<1)return null;
 const q=expected.quote;
 if(expected.country!=="IN"&&!q)return null;
 if(expected.country!=="IN"&&q?.kind==="QUOTE_REQUIRED"){
  if(order.status!=="REQUESTED"||data.onlineCheckoutAvailable||order.shippingPaise!==null||order.taxPaise!==null||order.totalPaise!==null||order.shippingQuote!==null)return null;
 }else{
  const shipping=expected.country==="IN"?0:q?.shippingPaise;
  const tax=expected.country==="IN"?0:q?.taxPaise;
  if(!amount(shipping)||!amount(tax)||order.shippingPaise!==shipping||order.taxPaise!==tax||!amount(order.totalPaise)||order.totalPaise!==expected.subtotalPaise+shipping+tax)return null;
  const snap=obj(order.shippingQuote);
  if(!snap||snap.country!==expected.country||snap.postalCode!==expected.postalCode||snap.shippingPaise!==shipping||snap.taxPaise!==tax||!nonempty(snap.carrier,4096)||!duties(snap.dutiesMode)||!Array.isArray(snap.rateVersions)||!snap.rateVersions.every(v=>nonempty(v,256)))return null;
  if(expected.country==="IN"){
   if(snap.kind!=="DOMESTIC_INCLUDED"||snap.expiresAt!==null||snap.dutiesMode!=="INCLUDED"||snap.rateVersions.length!==0)return null;
  }else if(snap.kind!=="PUBLISHED_RATE"||snap.carrier!==q?.carrier||snap.dutiesMode!==q?.dutiesMode||snap.expiresAt!==q?.expiresAt||!snap.rateVersions.length)return null;
  if(data.onlineCheckoutAvailable&&order.status!=="CONFIRMED")return null;
 }
 return {order:order as CheckoutOrder,onlineCheckoutAvailable:data.onlineCheckoutAvailable};
}
export function checkoutErrorKey(status:number):"sessionExpired"|"changed"|"invalid"|"limited"|"uncertain"{
 if(status===401||status===403)return "sessionExpired";
 if(status===409)return "changed";
 if(status===400||status===422)return "invalid";
 if(status===429)return "limited";
 return "uncertain";
}

/** Opaque persisted cart-attempt ID; it is not an authorization credential. */
export function validCheckoutIntent(value:unknown):value is string{
 return typeof value==="string"&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
}
export function readCartIntent(value:unknown,fingerprint:string):string|null{
 const record=obj(value);
 return record?.version===1&&record.fingerprint===fingerprint&&validCheckoutIntent(record.intent)?record.intent.toLowerCase():null;
}
export function checkoutIntentAlreadyUsed(status:number,value:unknown):boolean{
 return status===409&&obj(obj(value)?.details)?.code==="ORDER_INTENT_ALREADY_USED";
}
