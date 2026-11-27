import type {CatalogueText, ShopProduct} from "@/lib/manual-catalogue";
import {isShippingCountry} from "@/lib/shop/shipping-rules";
export type ShippingAdminProduct={id:string;name:string;names?:CatalogueText;status:string};
export type ShippingAdminRate={id:string;country:string;productId:string;postalPrefix:string;shippingPaisePerUnit:number;taxPaisePerUnit:number;maxQuantity:number;carrier:string;evidenceReference:string;dutiesMode:"INCLUDED"|"RECIPIENT_MAY_PAY";expiresAt:string;active:boolean;version:number};
export type ShippingRateInput=Omit<ShippingAdminRate,'id'|'version'>&{id?:string;expectedVersion:number;confirmed:boolean};
export const shopAdminObject=(value:unknown):Record<string,unknown>|null=>value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:null;
const text=(value:unknown,min=0,max=1500):value is string=>typeof value==='string'&&value.length>=min&&value.length<=max;
const integer=(value:unknown,min:number,max:number)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=min&&value<=max;
const date=(value:unknown):value is string=>typeof value==='string'&&Number.isFinite(Date.parse(value));
const localized=(value:unknown):value is CatalogueText=>{const row=shopAdminObject(value);return !!row&&['en','hi','hinglish'].every(key=>text(row[key],0,1200));};
const rights=(value:unknown)=>['OWNED','LICENSED','SUPPLIER_AUTHORIZED'].includes(String(value));
export function isShippingAdminRate(value:unknown):value is ShippingAdminRate{
 const r=shopAdminObject(value);return !!r&&text(r.id,1,140)&&text(r.country,2,2)&&r.country!=='IN'&&isShippingCountry(r.country)&&text(r.productId,1,128)&&/^[a-zA-Z0-9-]+$/.test(r.productId)&&text(r.postalPrefix,0,12)&&/^[A-Z0-9]*$/.test(r.postalPrefix)&&integer(r.shippingPaisePerUnit,0,1e7)&&integer(r.taxPaisePerUnit,0,1e7)&&integer(r.maxQuantity,1,10)&&text(r.carrier,2,120)&&text(r.evidenceReference,8,500)&&['INCLUDED','RECIPIENT_MAY_PAY'].includes(String(r.dutiesMode))&&date(r.expiresAt)&&typeof r.active==='boolean'&&integer(r.version,1,Number.MAX_SAFE_INTEGER);
}
export function readShippingAdmin(value:unknown):{rates:ShippingAdminRate[];products:ShippingAdminProduct[]}|null{
 const data=shopAdminObject(shopAdminObject(value)?.data),rates=data?.rates,products=data?.products;
 if(!Array.isArray(rates)||rates.length>2000||!rates.every(isShippingAdminRate)||new Set(rates.map(r=>r.id)).size!==rates.length||!Array.isArray(products)||!products.every(value=>{const p=shopAdminObject(value);return !!p&&text(p.id,1,128)&&text(p.name)&&['active','inactive'].includes(String(p.status))&&(p.names===undefined||localized(p.names));})||new Set(products.map(p=>p.id)).size!==products.length)return null;
 return {rates,products};
}
export function savedShippingRate(value:unknown,input:ShippingRateInput,existingIds:readonly string[]):ShippingAdminRate|null{
 const rate=shopAdminObject(shopAdminObject(value)?.data)?.rate;if(!isShippingAdminRate(rate))return null;
 if(input.id?rate.id!==input.id:existingIds.includes(rate.id))return null;
 return rate.version===input.expectedVersion+1&&rate.country===input.country&&rate.productId===input.productId&&rate.postalPrefix===input.postalPrefix.trim()&&rate.shippingPaisePerUnit===input.shippingPaisePerUnit&&rate.taxPaisePerUnit===input.taxPaisePerUnit&&rate.maxQuantity===input.maxQuantity&&rate.carrier===input.carrier.trim()&&rate.evidenceReference===input.evidenceReference.trim()&&rate.dutiesMode===input.dutiesMode&&rate.active===input.active&&Date.parse(rate.expiresAt)===Date.parse(input.expiresAt)?rate:null;
}
export function isAdminShopProduct(value:unknown):value is ShopProduct{
 const p=shopAdminObject(value);if(!p||!text(p.id,1,128)||!text(p.slug,1,101)||!/^[a-z0-9][a-z0-9-]*$/.test(p.slug)||!text(p.category,1,70)||!text(p.purpose,0,100)||!text(p.imageUrl,0,1500)||!['active','inactive'].includes(String(p.status))||typeof p.featured!=='boolean'||!date(p.createdAt)||!date(p.updatedAt)||!['name','shortDescription','longDescription','imageAlt','priceLabel','howToUse','careNote','disclaimer'].every(key=>localized(p[key])))return false;
 if(!Array.isArray(p.tags)||p.tags.length>24||!p.tags.every(tag=>text(tag,0,100))||!(p.unitPricePaise===undefined||p.unitPricePaise===null||integer(p.unitPricePaise,100,1e8))||!(p.imageRights===undefined||rights(p.imageRights))||!(p.imageEvidenceUrl===undefined||text(p.imageEvidenceUrl,0,500)))return false;
 return p.galleryImages===undefined||Array.isArray(p.galleryImages)&&p.galleryImages.length<=8&&p.galleryImages.every(value=>{const image=shopAdminObject(value);return !!image&&text(image.url,1,1500)&&text(image.alt,3,180)&&rights(image.imageRights)&&text(image.evidenceUrl,0,500)&&(image.credit===undefined||text(image.credit,0,260))&&(image.licenseName===undefined||text(image.licenseName,0,110))&&(image.licenseUrl===undefined||text(image.licenseUrl,0,500));});
}
export function readAdminShopCatalogue(value:unknown):{products:ShopProduct[];version:number}|null{
 const data=shopAdminObject(shopAdminObject(value)?.data),products=data?.products;
 return data&&integer(data.version,0,Number.MAX_SAFE_INTEGER)&&Array.isArray(products)&&products.length<=150&&products.every(isAdminShopProduct)&&new Set(products.map(p=>p.id)).size===products.length&&new Set(products.map(p=>p.slug)).size===products.length?{products,version:Number(data.version)}:null;
}
function canonical(value:unknown):unknown{if(Array.isArray(value))return value.map(canonical);const object=shopAdminObject(value);return object?Object.fromEntries(Object.keys(object).sort().filter(key=>object[key]!==undefined).map(key=>[key,canonical(object[key])])):value;}
export function savedAdminShopCatalogue(value:unknown,products:ShopProduct[],previousVersion:number){const saved=readAdminShopCatalogue(value);return saved&&saved.version===previousVersion+1&&JSON.stringify(canonical(saved.products))===JSON.stringify(canonical(products))?saved:null;}
export function shippingPaise(value:string):number|null{const clean=value.trim();if(!/^\d+(?:\.\d{1,2})?$/.test(clean))return null;const result=Math.round(Number(clean)*100);return integer(result,0,1e7)?result:null;}
