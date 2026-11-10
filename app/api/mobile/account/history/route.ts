import {NextRequest} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/db";
import {getMobileAccountUser} from "@/lib/mobile/account-link";
import {fail,handleApiError,ok} from "@/lib/api";
const schema=z.object({
 section:z.enum(["kundlis","kundliReports","reportRequests","purchasedReports",
   "shopOrders","pujaBookings","consultations","payments","appointments"]),
 page:z.coerce.number().int().min(1).max(1000)
}).strict();
export const dynamic="force-dynamic";
/** Older records remain scoped to the JWT's verified userId, never an email or
 * user-submitted account identifier. Page size 30, bounded offset.
 */
export async function GET(request:NextRequest){
 try{
  const user=await getMobileAccountUser(request);
  if(!user)return fail("Mobile account session required.",401);
  const parsed=schema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if(!parsed.success)return fail("Invalid history section/page.",422);
  const {section,page}=parsed.data,userId=user.id;
  const opts={skip:page*30,take:31,
    orderBy:[{createdAt:"desc" as const},{id:"desc" as const}]};
  let records:unknown[]=[];
  switch(section){
   case "kundlis":records=await prisma.kundli.findMany({where:{userId},...opts,
     select:{id:true,name:true,birthDate:true,birthPlace:true,isFavorite:true,createdAt:true}});break;
   case "kundliReports":records=await prisma.kundliReport.findMany({where:{userId},...opts,
     select:{id:true,name:true,createdAt:true}});break;
   case "reportRequests":records=await prisma.reportRequest.findMany({where:{userId},...opts,
     select:{id:true,reportSlug:true,status:true,paymentStatus:true,deliveryStatus:true,createdAt:true}});break;
   case "purchasedReports":records=await prisma.purchasedReport.findMany({where:{userId},...opts,
     select:{id:true,title:true,status:true,createdAt:true}});break;
   case "shopOrders":records=await prisma.shopOrder.findMany({where:{userId},...opts,
     select:{id:true,status:true,paymentStatus:true,totalPaise:true,trackingReference:true,createdAt:true}});break;
   case "pujaBookings":records=await prisma.pujaBookingRequest.findMany({where:{userId},...opts,
     select:{id:true,topicId:true,status:true,preferredDate:true,city:true,quotedPricePaise:true,createdAt:true}});break;
   case "consultations":records=await prisma.consultationBooking.findMany({where:{userId},...opts,
     select:{id:true,mode:true,status:true,paymentStatus:true,scheduledAt:true,createdAt:true}});break;
   case "payments":{
     const rows=await prisma.payment.findMany({where:{userId},...opts,
       select:{id:true,purpose:true,status:true,currency:true,amount:true,createdAt:true}});
     records=rows.map(x=>({...x,amount:Number(x.amount)}));break;
   }
   case "appointments":records=await prisma.appointment.findMany({where:{userId},...opts,
     select:{id:true,mode:true,status:true,scheduledAt:true}});break;
  }
  const hasMore=records.length>30;
  return ok({section,page,records:records.slice(0,30),hasMore,nextPage:hasMore?page+1:null});
 }catch(error){return handleApiError(error);}
}
