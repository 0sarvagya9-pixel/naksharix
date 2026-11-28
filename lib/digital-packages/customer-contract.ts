import {getPackageDefinition,type PackageOffer} from "@/lib/digital-packages/catalogue";
import type {PackageDraft} from "@/lib/digital-packages/input";
export type PackageOrder={id:string;productKey:string;productVersion:"v1";pricePaise:number;status:string;expiresAt:string;createdAt:string;items:{id:string;kind:string;position:number;status:string;attempts:number;pdfSize:number|null}[]};
const record=(v:unknown):v is Record<string,unknown>=>Boolean(v)&&typeof v==="object"&&!Array.isArray(v);
const identifier=(v:unknown):v is string=>typeof v==="string"&&/^[a-zA-Z0-9_-]{1,100}$/.test(v);
const date=(v:unknown):v is string=>typeof v==="string"&&Number.isFinite(Date.parse(v));
export function readPackageOrder(value:unknown):PackageOrder|null{
 if(!record(value)||!identifier(value.id)||typeof value.productKey!=="string")return null;
 const def=getPackageDefinition(value.productKey);
 if(!def||value.productVersion!==def.version||!Number.isSafeInteger(value.pricePaise)||Number(value.pricePaise)<100||Number(value.pricePaise)>10000000||typeof value.status!=="string"||!["DRAFT","PAYMENT_PENDING","PAID","REVIEW","REFUNDED","CANCELED"].includes(value.status)||!date(value.expiresAt)||!date(value.createdAt)||!Array.isArray(value.items)||value.items.length!==def.kinds.length)return null;
 const seen=new Set<string>();
 for(let i=0;i<value.items.length;i++){
  const item=value.items[i];if(!record(item)||!identifier(item.id)||seen.has(item.id)||item.kind!==def.kinds[i]||item.position!==i||typeof item.status!=="string"||!["PENDING","GENERATING","RETRY","READY","FAILED"].includes(item.status)||!Number.isSafeInteger(item.attempts)||Number(item.attempts)<0||!(item.pdfSize===null||Number.isSafeInteger(item.pdfSize)&&Number(item.pdfSize)>0))return null;
  seen.add(item.id);
 }
 return value as unknown as PackageOrder;
}
export function readPackageAccount(value:unknown):{offers:PackageOffer[];orders:PackageOrder[]}|null{
 if(!record(value)||value.available!==true||!Array.isArray(value.offers)||value.offers.length>7||!Array.isArray(value.orders)||value.orders.length>30)return null;
 const offers:PackageOffer[]=[],keys=new Set<string>();
 for(const row of value.offers){
  if(!record(row)||typeof row.key!=="string")return null;const def=getPackageDefinition(row.key);
  if(!def||keys.has(def.key)||row.version!==def.version||!Number.isSafeInteger(row.pricePaise)||Number(row.pricePaise)<100||Number(row.pricePaise)>10000000)return null;
  keys.add(def.key);offers.push({...def,pricePaise:Number(row.pricePaise)});
 }
 const orders:PackageOrder[]=[],ids=new Set<string>();
 for(const row of value.orders){const order=readPackageOrder(row);if(!order||ids.has(order.id))return null;ids.add(order.id);orders.push(order);}
 return {offers,orders};
}
export function readPackageDraftAck(value:unknown,input:PackageDraft):PackageOrder|null{
 if(!record(value)||value.clientIntent!==input.clientIntent)return null;const order=readPackageOrder(value.order);
 return order&&order.productKey===input.productKey&&order.productVersion===input.version&&order.pricePaise===input.pricePaise?order:null;
}
