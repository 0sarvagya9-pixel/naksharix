export type ManualRate={reportSlug:string;pricePaise:number|null;available:boolean;deliveryDays:number|null;note:string};
export type PujaOffer={topicId:string;pricePaise:number|null;durationMinutes:number|null;available:boolean;note:string};
export type PujaPartner={id:string;name:string;region:string;traditions:string[];reviewStatus:string;evidenceUrl:string|null};
const object=(v:unknown):v is Record<string,unknown>=>Boolean(v)&&typeof v==="object"&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==="string"&&v.trim().length>0;
function price(v:unknown){return v===null||Number.isSafeInteger(v)&&Number(v)>=100&&Number(v)<=100000000;}
function count(v:unknown,min:number,max:number){return v===null||Number.isInteger(v)&&Number(v)>=min&&Number(v)<=max;}
export function isManualRate(v:unknown):v is ManualRate{return object(v)&&text(v.reportSlug)&&price(v.pricePaise)&&typeof v.available==="boolean"&&(!v.available||v.pricePaise!==null)&&count(v.deliveryDays,1,180)&&typeof v.note==="string";}
export function isPujaOffer(v:unknown):v is PujaOffer{return object(v)&&text(v.topicId)&&price(v.pricePaise)&&typeof v.available==="boolean"&&(!v.available||v.pricePaise!==null)&&count(v.durationMinutes,15,2880)&&typeof v.note==="string";}
export function matchingManualRate(v:unknown,input:ManualRate):v is ManualRate{return isManualRate(v)&&v.reportSlug===input.reportSlug&&v.pricePaise===input.pricePaise&&v.available===input.available&&v.deliveryDays===input.deliveryDays&&v.note===input.note;}
export function matchingPujaOffer(v:unknown,input:PujaOffer):v is PujaOffer{return isPujaOffer(v)&&v.topicId===input.topicId&&v.pricePaise===input.pricePaise&&v.available===input.available&&v.durationMinutes===input.durationMinutes&&v.note===input.note;}
export function isPujaPartner(v:unknown):v is PujaPartner{return object(v)&&text(v.id)&&text(v.name)&&text(v.region)&&Array.isArray(v.traditions)&&v.traditions.every(text)&&typeof v.reviewStatus==="string"&&["PENDING","VERIFIED","REJECTED","SUSPENDED"].includes(v.reviewStatus)&&(v.evidenceUrl===null||typeof v.evidenceUrl==="string");}
export function safeEvidenceLink(value:string|null){if(!value)return null;try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password&&!u.port&&u.hostname.includes(".")&&!u.hostname.endsWith(".local")?u.href:null;}catch{return null;}}
export function matchingPartnerCreate(v:unknown,input:Omit<PujaPartner,"id"|"reviewStatus">):v is PujaPartner{return isPujaPartner(v)&&v.reviewStatus==="PENDING"&&v.name===input.name&&v.region===input.region&&JSON.stringify(v.traditions)===JSON.stringify(input.traditions)&&v.evidenceUrl===input.evidenceUrl;}
