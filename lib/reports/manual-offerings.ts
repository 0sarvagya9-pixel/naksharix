import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { manualReports } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
export type PublicManualReportOffer={pricePaise:number;deliveryDays:number|null;note:string};
export async function getPublishedManualReportOffers():Promise<Record<string,PublicManualReportOffer>>{
 try{
  const rows=await prisma.manualReportOffering.findMany({where:{available:true,pricePaise:{gte:100}},
   select:{reportSlug:true,pricePaise:true,deliveryDays:true,note:true}});
  const allowed=new Set(manualReports.filter(p=>!getManualReportCheckout(p.slug)).map(p=>p.slug));
  return Object.fromEntries(rows.filter(p=>allowed.has(p.reportSlug)&&p.pricePaise!==null).map(p=>[
   p.reportSlug,{pricePaise:p.pricePaise!,deliveryDays:p.deliveryDays,note:p.note}
  ]));
 }catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2021")return {};throw e}
}
