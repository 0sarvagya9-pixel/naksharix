import { isShippingCountry, readShippingSnapshot } from "@/lib/shop/shipping-rules";
export type ShopOrder = {
  id:string; userId:string; items:unknown; customerName:string; customerPhone:string;
  deliveryCity:string; deliveryState:string; deliveryAddress:string; deliveryCountry:string; postalCode:string; shippingQuote:unknown;
  subtotalPaise:number; shippingPaise:number|null; taxPaise:number|null; totalPaise:number|null;
  status:string; paymentStatus:string; trackingReference:string|null; fulfillmentEvidenceUrl:string|null; adminNote:string; version:number; createdAt:string;
};
export type PujaBooking = {
  id:string; userId:string; topicId:string; quotedPricePaise:number; preferredDate:string; city:string;
  devoteeName:string; gotra:string|null; sankalpNote:string; customerPhone:string; status:string;
  partnerId:string|null; scheduledAt:string|null; adminNote:string; evidenceUrl:string|null; version:number; createdAt:string;
};
export const fulfilmentObject = (value:unknown):Record<string,unknown>|null => value!==null && typeof value==='object' && !Array.isArray(value) ? value as Record<string,unknown> : null;
const nonempty=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0;
const nullableText=(value:unknown)=>value===null||typeof value==='string';
const money=(value:unknown)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0;
const date=(value:unknown)=>typeof value==='string'&&Number.isFinite(Date.parse(value));
const nullableMoney=(value:unknown)=>value===null||money(value);
const sameDate=(value:string|null,expected:string|null)=>value===null&&expected===null||value!==null&&expected!==null&&Date.parse(value)===Date.parse(expected);
export function isShopOrder(value:unknown):value is ShopOrder {
  const row=fulfilmentObject(value);
  return !!row&&nonempty(row.id)&&nonempty(row.userId)&&['customerName','customerPhone','deliveryCity','deliveryState','deliveryAddress','deliveryCountry','postalCode','adminNote'].every(key=>typeof row[key]==='string')&&isShippingCountry(String(row.deliveryCountry))&&date(row.createdAt)&&Number.isSafeInteger(row.version)&&Number(row.version)>0&&money(row.subtotalPaise)&&nullableMoney(row.shippingPaise)&&nullableMoney(row.taxPaise)&&nullableMoney(row.totalPaise)&&nullableText(row.trackingReference)&&nullableText(row.fulfillmentEvidenceUrl)&&['REQUESTED','CONFIRMED','PACKING','DISPATCHED','DELIVERED','CANCELED'].includes(String(row.status))&&['UNPAID','PENDING','PAID','FAILED','REFUNDED','ADMIN_BYPASS','FREE'].includes(String(row.paymentStatus));
}
export function isPujaBooking(value:unknown):value is PujaBooking {
  const row=fulfilmentObject(value);
  return !!row&&nonempty(row.id)&&nonempty(row.userId)&&['topicId','city','devoteeName','sankalpNote','customerPhone','adminNote'].every(key=>typeof row[key]==='string')&&money(row.quotedPricePaise)&&date(row.preferredDate)&&date(row.createdAt)&&Number.isSafeInteger(row.version)&&Number(row.version)>0&&nullableText(row.gotra)&&nullableText(row.partnerId)&&(row.scheduledAt===null||date(row.scheduledAt))&&nullableText(row.evidenceUrl)&&['REQUESTED','CONFIRMED','SCHEDULED','IN_PROGRESS','COMPLETED','CANCELED','REJECTED'].includes(String(row.status));
}
export function readShopOrders(value:unknown):ShopOrder[]|null {
  const rows=fulfilmentObject(fulfilmentObject(value)?.data)?.orders;
  return Array.isArray(rows)&&rows.every(isShopOrder)?rows:null;
}
export function savedShopOrder(value:unknown,draft:ShopOrder,previous:ShopOrder,quote?:{carrier:string;expiresAt:string;dutiesMode:string}):ShopOrder|null {
  const row=fulfilmentObject(fulfilmentObject(value)?.data)?.order;
  if(!isShopOrder(row))return null;
  const shipping=draft.shippingPaise??previous.shippingPaise,tax=draft.taxPaise??previous.taxPaise;
  const total=shipping!==null&&tax!==null?previous.subtotalPaise+shipping+tax:null;
  if(quote){const saved=readShippingSnapshot(row.shippingQuote);if(!saved||saved.kind!=='MANUAL_QUOTE'||saved.carrier!==quote.carrier.trim()||saved.expiresAt!==quote.expiresAt||saved.dutiesMode!==quote.dutiesMode||saved.shippingPaise!==shipping||saved.taxPaise!==tax)return null;}
  return row.id===draft.id&&row.userId===previous.userId&&row.version===previous.version+1&&row.status===draft.status&&row.paymentStatus===previous.paymentStatus&&row.subtotalPaise===previous.subtotalPaise&&row.shippingPaise===shipping&&row.taxPaise===tax&&row.totalPaise===total&&row.trackingReference===(draft.trackingReference?.trim()??previous.trackingReference)&&row.fulfillmentEvidenceUrl===(draft.fulfillmentEvidenceUrl??previous.fulfillmentEvidenceUrl)&&row.adminNote===draft.adminNote.trim()?row:null;
}
export function savedPujaBooking(value:unknown,draft:PujaBooking,previous:PujaBooking):PujaBooking|null {
  const row=fulfilmentObject(fulfilmentObject(value)?.data)?.booking;
  if(!isPujaBooking(row))return null;
  return row.id===draft.id&&row.userId===previous.userId&&row.topicId===previous.topicId&&row.version===previous.version+1&&row.status===draft.status&&row.quotedPricePaise===previous.quotedPricePaise&&row.partnerId===(draft.partnerId||previous.partnerId)&&sameDate(row.scheduledAt,draft.scheduledAt||previous.scheduledAt)&&row.adminNote===draft.adminNote.trim()&&row.evidenceUrl===draft.evidenceUrl?row:null;
}
export function notificationRetryRecorded(value:unknown,expected:{kind:'shop'|'puja';id:string;version:number;status:string}) {
  const data=fulfilmentObject(fulfilmentObject(value)?.data),notice=fulfilmentObject(data?.notification);
  return !!data&&data.kind===expected.kind&&data.id===expected.id&&data.version===expected.version&&data.status===expected.status&&!!notice&&['provider_accepted','unavailable','failed','recipient_missing','not_needed'].includes(String(notice.outcome));
}
export function consultationUpdateRecorded(value:unknown,expected:{id:string;expectedUpdatedAt:string;status:string;paymentStatus:string;meetingLink:string;adminNote:string}): value is {data:{booking:{updatedAt:string}}} {
  const row=fulfilmentObject(fulfilmentObject(fulfilmentObject(value)?.data)?.booking),metadata=fulfilmentObject(row?.metadata);
  return !!row&&row.id===expected.id&&row.status===expected.status&&row.paymentStatus===expected.paymentStatus&&date(row.updatedAt)&&Date.parse(String(row.updatedAt))>Date.parse(expected.expectedUpdatedAt)&&!!metadata&&metadata.meetingLink===expected.meetingLink&&metadata.adminNote===expected.adminNote;
}
