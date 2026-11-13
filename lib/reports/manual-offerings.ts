import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isTransientDatabaseError, retryTransientDatabaseRead } from "@/lib/db-transient";
import { manualReports } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
export type PublicManualReportOffer={pricePaise:number;deliveryDays:number|null;note:string};
export async function getPublishedManualReportOffers():Promise<Record<string,PublicManualReportOffer>>{
 // All currently published report slugs have fixed canonical checkout prices.
 // Avoid a needless DB read (and outage) when no manual-only offers remain.
 const allowed=new Set(manualReports.filter(p=>!getManualReportCheckout(p.slug)).map(p=>p.slug));
 if(!allowed.size)return {};
 try{
  const rows=await retryTransientDatabaseRead(() => prisma.manualReportOffering.findMany({where:{available:true,pricePaise:{gte:100}},
   select:{reportSlug:true,pricePaise:true,deliveryDays:true,note:true}}));
  return Object.fromEntries(rows.filter(p=>allowed.has(p.reportSlug)&&p.pricePaise!==null).map(p=>[
   p.reportSlug,{pricePaise:p.pricePaise!,deliveryDays:p.deliveryDays,note:p.note}
  ]));
 }catch(e){
  if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2021")return {};
  // No unverified manual price is published while the authoritative DB is down.
  if(isTransientDatabaseError(e))return {};
  throw e;
}
}
