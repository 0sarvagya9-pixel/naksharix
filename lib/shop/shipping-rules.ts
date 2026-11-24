// Pure, shared address and rate rules. Do not use customer IP to choose shipping.
export const COUNTRY_CODES=("AF AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW").split(" ");
const codes=new Set(COUNTRY_CODES);
const names=new Intl.DisplayNames(["en"],{type:"region"});
export function countryName(code:string){return codes.has(code)?names.of(code)??code:"Unknown destination";}
export const SHIPPING_COUNTRIES=COUNTRY_CODES.map(code=>({code,name:countryName(code)})).sort((a,b)=>a.code==="IN"?-1:b.code==="IN"?1:a.name.localeCompare(b.name,"en"));
export const isShippingCountry=(code:string)=>codes.has(code);
export const SHIPPING_TERMS_VERSION="shop-international-shipping-2026-11-24-v1";
export const CUSTOMS_NOTICE="Destination customs duties, import VAT or carrier collection fees may be payable on arrival unless the confirmed quote explicitly includes them. Do not assume customs charges are zero.";
export function normalizePostal(code:string,value:string){const v=value.trim().toUpperCase().replace(/\s+/g," ");return code==="IN"?v:v;}
export const postalKey=(v:string)=>v.toUpperCase().replace(/[\s-]/g,"");
const patterns:Record<string,RegExp>={IN:/^[1-9]\d{5}$/,US:/^\d{5}(-\d{4})?$/,CA:/^[A-Z]\d[A-Z] ?\d[A-Z]\d$/,GB:/^(GIR ?0AA|[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/,AU:/^\d{4}$/,NZ:/^\d{4}$/,DE:/^\d{5}$/,FR:/^\d{5}$/,IT:/^\d{5}$/,ES:/^\d{5}$/,NL:/^\d{4} ?[A-Z]{2}$/,SG:/^\d{6}$/,JP:/^\d{3}-?\d{4}$/,KR:/^\d{5}$/,BR:/^\d{5}-?\d{3}$/,ZA:/^\d{4}$/,CH:/^\d{4}$/,AT:/^\d{4}$/,BE:/^\d{4}$/,SE:/^\d{3} ?\d{2}$/,NO:/^\d{4}$/,FI:/^\d{5}$/,DK:/^\d{4}$/,IE:/^[A-Z\d]{3} ?[A-Z\d]{4}$/,PT:/^\d{4}-?\d{3}$/,PL:/^\d{2}-?\d{3}$/,MX:/^\d{5}$/,PK:/^\d{5}$/,BD:/^\d{4}$/,MY:/^\d{5}$/,TH:/^\d{5}$/,ID:/^\d{5}$/,PH:/^\d{4}$/,SA:/^\d{5}$/,IL:/^\d{7}$/,LK:/^\d{5}$/,CN:/^\d{6}$/};
const noPostal=new Set(["AE","HK","MO","QA","BH","OM"]);
export function postalRequired(code:string){return Boolean(patterns[code])&&!noPostal.has(code);}
export function validPostal(code:string,value:string){
 if(!isShippingCountry(code))return false;
 const v=normalizePostal(code,value);
 if(patterns[code])return patterns[code].test(v);
 return !v||/^[A-Z0-9][A-Z0-9 -]{0,15}$/.test(v);
}
export function postalHint(code:string){
 if(code==="IN")return "6-digit PIN code";
 if(code==="US")return "ZIP code, e.g. 10001";
 if(code==="CA")return "Postal code, e.g. A1A 1A1";
 if(code==="GB")return "Postcode, e.g. SW1A 1AA";
 if(noPostal.has(code))return "Postal code (if applicable)";
 return postalRequired(code)?"ZIP / postal code":"ZIP / postal code (if applicable)";
}
export type CanonicalShippingLine={productId:string;name:string;quantity:number;unitPricePaise:number;lineTotalPaise:number};
export type RateRule={id:string;country:string;productId:string;postalPrefix:string;shippingPaisePerUnit:number;taxPaisePerUnit:number;maxQuantity:number;carrier:string;evidenceReference:string;dutiesMode:string;expiresAt:Date|string;active:boolean;reviewedBy:string;version:number};
export type ShippingSnapshot={kind:"DOMESTIC_INCLUDED"|"PUBLISHED_RATE"|"MANUAL_QUOTE";country:string;postalCode:string;shippingPaise:number;taxPaise:number;carrier:string;dutiesMode:"INCLUDED"|"RECIPIENT_MAY_PAY";expiresAt:string|null;rateVersions:string[]};
export type ShippingResult={kind:"DOMESTIC_INCLUDED"|"PUBLISHED_RATE"|"QUOTE_REQUIRED";subtotalPaise:number;shippingPaise:number|null;taxPaise:number|null;totalPaise:number|null;snapshot:ShippingSnapshot|null};
const integer=(n:unknown)=>typeof n==="number"&&Number.isSafeInteger(n)&&n>=0&&n<=1_000_000_000;
export function computeShipping(country:string,postal:string,lines:CanonicalShippingLine[],rates:RateRule[],now=Date.now()):ShippingResult{
 if(!isShippingCountry(country)||!validPostal(country,postal)||!lines.length||new Set(lines.map(x=>x.productId)).size!==lines.length)throw Error("SHIPPING_INVALID_INPUT");
 if(lines.some(x=>!integer(x.unitPricePaise)||x.unitPricePaise<100||!Number.isInteger(x.quantity)||x.quantity<1||x.quantity>10||x.lineTotalPaise!==x.unitPricePaise*x.quantity))throw Error("SHIPPING_INVALID_CART");
 const subtotalPaise=lines.reduce((n,l)=>n+l.lineTotalPaise,0);
 if(!integer(subtotalPaise))throw Error("SHIPPING_INVALID_CART");
 const normalized=normalizePostal(country,postal);
 const pending:ShippingResult={kind:"QUOTE_REQUIRED",subtotalPaise,shippingPaise:null,taxPaise:null,totalPaise:null,snapshot:null};
 if(country==="IN")return {kind:"DOMESTIC_INCLUDED",subtotalPaise,shippingPaise:0,taxPaise:0,totalPaise:subtotalPaise,snapshot:{kind:"DOMESTIC_INCLUDED",country,postalCode:normalized,shippingPaise:0,taxPaise:0,carrier:"Domestic seller fulfilment",dutiesMode:"INCLUDED",expiresAt:null,rateVersions:[]}};
 const matched:RateRule[]=[];
 for(const line of lines){
  const eligible=rates.filter(r=>r.country===country&&r.productId===line.productId&&r.active&&r.reviewedBy&&r.evidenceReference.trim().length>=8&&r.carrier.trim().length>=2&&Number.isFinite(new Date(r.expiresAt).getTime())&&new Date(r.expiresAt).getTime()>now&&Number.isInteger(r.maxQuantity)&&r.maxQuantity>=line.quantity&&r.maxQuantity<=10&&integer(r.shippingPaisePerUnit)&&integer(r.taxPaisePerUnit)&&["INCLUDED","RECIPIENT_MAY_PAY"].includes(r.dutiesMode)&&(r.postalPrefix===""||postalKey(normalized).startsWith(r.postalPrefix)));
  // A more specific published region overrides the country-wide rate. Reject
  // ambiguous ties rather than undercharging. No invented or inferred rate.
  eligible.sort((a,b)=>b.postalPrefix.length-a.postalPrefix.length);
  if(!eligible.length||(eligible.length>1&&eligible[0].postalPrefix.length===eligible[1].postalPrefix.length))return pending;
  matched.push(eligible[0]);
 }
 const shippingPaise=lines.reduce((n,l,i)=>n+l.quantity*matched[i].shippingPaisePerUnit,0),taxPaise=lines.reduce((n,l,i)=>n+l.quantity*matched[i].taxPaisePerUnit,0);
 const totalPaise=subtotalPaise+shippingPaise+taxPaise;
 if(![shippingPaise,taxPaise,totalPaise].every(integer))return pending;
 const expiry=Math.min(...matched.map(r=>new Date(r.expiresAt).getTime()));
 return {kind:"PUBLISHED_RATE",subtotalPaise,shippingPaise,taxPaise,totalPaise,snapshot:{kind:"PUBLISHED_RATE",country,postalCode:normalized,shippingPaise,taxPaise,carrier:[...new Set(matched.map(r=>r.carrier))].join(" + "),dutiesMode:matched.some(r=>r.dutiesMode==="RECIPIENT_MAY_PAY")?"RECIPIENT_MAY_PAY":"INCLUDED",expiresAt:new Date(expiry).toISOString(),rateVersions:matched.map(r=>r.id+":"+r.version).sort()}};
}
export function readShippingSnapshot(v:unknown):ShippingSnapshot|null{
 if(!v||typeof v!=="object"||Array.isArray(v))return null;
 const r=v as ShippingSnapshot;
 if(!["DOMESTIC_INCLUDED","PUBLISHED_RATE","MANUAL_QUOTE"].includes(r.kind)||!isShippingCountry(r.country)||typeof r.postalCode!=="string"||!validPostal(r.country,r.postalCode)||!integer(r.shippingPaise)||!integer(r.taxPaise)||typeof r.carrier!=="string"||!r.carrier.trim()||!["INCLUDED","RECIPIENT_MAY_PAY"].includes(r.dutiesMode)||!Array.isArray(r.rateVersions))return null;
 if(r.kind!=="DOMESTIC_INCLUDED"&&(r.country==="IN"||typeof r.expiresAt!=="string"||!Number.isFinite(Date.parse(r.expiresAt))))return null;
 return r;
}
export function shippingPayable(order:{deliveryCountry:string;postalCode:string;shippingQuote:unknown;shippingPaise:number|null;taxPaise:number|null;subtotalPaise:number;totalPaise:number|null},now=Date.now()){
 if(!isShippingCountry(order.deliveryCountry)||!validPostal(order.deliveryCountry,order.postalCode)||!integer(order.shippingPaise)||!integer(order.taxPaise)||!integer(order.totalPaise)||order.totalPaise!==order.subtotalPaise+order.shippingPaise!+order.taxPaise!)return false;
 // Preserve previous India orders, whose original shipping was seller-included.
 if(order.deliveryCountry==="IN")return true;
 const quote=readShippingSnapshot(order.shippingQuote);
 return !!quote&&quote.country===order.deliveryCountry&&quote.kind!=="DOMESTIC_INCLUDED"&&quote.postalCode===normalizePostal(order.deliveryCountry,order.postalCode)&&quote.shippingPaise===order.shippingPaise&&quote.taxPaise===order.taxPaise&&Date.parse(quote.expiresAt??"")>now;
}
