export const PACKAGE_TERMS_VERSION="digital-package-v1";
export const packageDefinitions=[
 {key:"business-name-numerology",version:"v1",title:"Business Name Numerology",description:"Compare 2–10 Roman-letter business name candidates using two clearly explained traditional letter-number systems. Includes calculation tables and a practical brand-name checklist. English PDF.",kinds:["business-name"],subjects:0,language:"en"},
 {key:"complete-life",version:"v1",title:"Complete Life Insights",description:"Five distinct personalized PDFs: Kundli, career, wealth, numerology and rolling twelve-month report. One person, one confirmed birth chart.",kinds:["premium-kundli","career-report","wealth-report","numerology-lo-shu-report","yearly-horoscope-report"],subjects:1,language:"multilingual"},
 {key:"family-three",version:"v1",title:"Family Kundli Package",description:"Three separate premium Kundli PDFs for three consenting people. Each person's birth details and permission are confirmed separately.",kinds:["premium-kundli","premium-kundli","premium-kundli"],subjects:3,language:"multilingual"},
 {key:"marriage-planning",version:"v1",title:"Marriage Planning Insights",description:"One personalized two-person compatibility PDF and one practical wedding-planning workbook. No astrologer consultation or venue reservation included.",kinds:["couple-kundli","marriage-workbook"],subjects:2,language:"multilingual"},
 {key:"astrology-workbook",version:"v1",title:"Understanding Your Kundli — Study Workbook",description:"Original English learning workbook with seven chapters, calculation examples, practical exercises and answer explanations. No certificate, live course or personalized reading included.",kinds:["study-workbook"],subjects:0,language:"en"}
] as const;
export type PackageKey=typeof packageDefinitions[number]["key"];
export type PackageDefinition=typeof packageDefinitions[number];
export type PackageOffer=PackageDefinition&{pricePaise:number};
export function getPackageDefinition(key:string){return packageDefinitions.find(p=>p.key===key);}
export function packagePriceOffers(raw:string|undefined,enabled:boolean):PackageOffer[]{
 if(!enabled||!raw||raw.length>4000)return [];
 try{
  const values=JSON.parse(raw);
  if(!Array.isArray(values)||values.length>packageDefinitions.length)return [];
  const seen=new Set<string>(),out:PackageOffer[]=[];
  for(const row of values){
   const def=getPackageDefinition(row?.key);
   if(!def||row.version!==def.version||seen.has(def.key)||!Number.isSafeInteger(row.pricePaise)||row.pricePaise<100||row.pricePaise>10000000)return [];
   seen.add(def.key);out.push({...def,pricePaise:row.pricePaise});
  }
  return out;
 }catch{return [];}
}
export function packagePriceMatches(a:{version:string;pricePaise:number},b:{version:string;pricePaise:number}){return a.version===b.version&&a.pricePaise===b.pricePaise;}
export function packageEntitled(order:{id:string;userId:string;productKey:string;productVersion:string;pricePaise:number;status:string;paymentId:string|null},payment:{id:string;userId:string;status:string;purpose:string;provider:string;providerPaymentId:string|null;amount:unknown;currency:string;metadata:unknown}|null){
 if(!payment||order.status!=="PAID"||payment.id!==order.paymentId||payment.userId!==order.userId||payment.status!=="PAID"||payment.purpose!=="DIGITAL_PACKAGE"||payment.provider!=="RAZORPAY"||!payment.providerPaymentId||payment.currency!=="INR"||Math.round(Number(payment.amount)*100)!==order.pricePaise)return false;
 const meta=payment.metadata&&typeof payment.metadata==="object"?payment.metadata as Record<string,unknown>:{};
 return meta.digitalPackageId===order.id&&meta.digitalPackageKey===order.productKey&&meta.digitalPackageVersion===order.productVersion&&meta.digitalPackagePricePaise===order.pricePaise&&meta.gatewayStatus==="captured";
}
export const packageStatusLabels:Record<string,string>={DRAFT:"Details saved; no payment",PAYMENT_PENDING:"Payment needs verification",PAID:"Verified purchase",REVIEW:"Merchant reconciliation required",REFUNDED:"Refunded",CANCELED:"Canceled"};
