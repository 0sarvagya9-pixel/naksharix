import {NextRequest} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/db";
import {getMobileAccountUser} from "@/lib/mobile/account-link";
import {fail,handleApiError,ok,validateJson} from "@/lib/api";
import {claimPublicAuthQuota,trustedPublicClientIp} from "@/lib/auth/public-quota";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 try{
  const user=await getMobileAccountUser(request);
  if(!user)return fail("Sign in to your Naksharix account on this phone.",401);
  const id=user.id;
  const [profile,kundlis,kundliReports,numerologyReports,horoscopeHistory,tarotReadings,reportRequests,purchasedReports,shopOrders,
    pujaBookings,consultations,payments,appointments]=await Promise.all([
    prisma.user.findUnique({where:{id},select:{id:true,email:true,name:true,phone:true,
      locale:true,dob:true,birthTime:true,birthPlace:true,createdAt:true}}),
    prisma.kundli.findMany({where:{userId:id},orderBy:{createdAt:"desc"},take:30,
      select:{id:true,name:true,birthDate:true,birthPlace:true,isFavorite:true,createdAt:true}}),
    prisma.kundliReport.findMany({where:{userId:id},orderBy:{createdAt:"desc"},take:30,
      select:{id:true,name:true,createdAt:true}}),
    prisma.numerologyReport.findMany({where:{userId:id},orderBy:{createdAt:"desc"},take:30,
      select:{id:true,name:true,lifePathNumber:true,createdAt:true}}),
    prisma.horoscope.findMany({where:{userId:id},orderBy:{createdAt:"desc"},take:30,
      select:{id:true,zodiac:true,period:true,createdAt:true}}),
    prisma.tarotReading.findMany({where:{userId:id},orderBy:{createdAt:"desc"},take:30,
      select:{id:true,spread:true,createdAt:true}}),
    prisma.reportRequest.findMany({where:{userId:id},orderBy:{createdAt:"desc"},take:30,
      select:{id:true,reportSlug:true,status:true,paymentStatus:true,deliveryStatus:true,createdAt:true}}),
    prisma.purchasedReport.findMany({where:{userId:id},orderBy:{createdAt:"desc"},take:30,
      select:{id:true,title:true,status:true,createdAt:true}}),
    prisma.shopOrder.findMany({where:{userId:id},orderBy:{createdAt:"desc"},take:30,
      select:{id:true,status:true,paymentStatus:true,totalPaise:true,trackingReference:true,createdAt:true}}),
    prisma.pujaBookingRequest.findMany({where:{userId:id},orderBy:{createdAt:"desc"},take:30,
      select:{id:true,topicId:true,status:true,preferredDate:true,city:true,quotedPricePaise:true,createdAt:true}}),
    prisma.consultationBooking.findMany({where:{userId:id},orderBy:{createdAt:"desc"},take:30,
      select:{id:true,mode:true,status:true,paymentStatus:true,scheduledAt:true,createdAt:true}}),
    prisma.payment.findMany({where:{userId:id},orderBy:{createdAt:"desc"},take:30,
      select:{id:true,purpose:true,status:true,currency:true,amount:true,createdAt:true}}),
    prisma.appointment.findMany({where:{userId:id},orderBy:{createdAt:"desc"},take:30,
      select:{id:true,mode:true,status:true,scheduledAt:true}})
  ]);
  if(!profile)return fail("Account is no longer available.",401);
  return ok({profile,history:{kundlis,kundliReports,numerologyReports,horoscopeHistory,tarotReadings,reportRequests,purchasedReports,
    shopOrders,pujaBookings,consultations,appointments,
    payments:payments.map(row=>({...row,amount:Number(row.amount)}))},
    meta:{source:"same_naksharix_website_database",userId:id,readOnlyHistory:true,
      guestHistoryNote:"Only records linked to this account are visible. Guest records are never merged by email."}});
 }catch(error){return handleApiError(error);}
}
const profileSchema=z.object({name:z.string().trim().min(2).max(80),
  locale:z.enum(["en","hi","hinglish"])}).strict();
export async function PATCH(request:NextRequest){
 try{
  const user=await getMobileAccountUser(request);
  if(!user)return fail("Unauthenticated mobile session.",401);
  const allowed=await claimPublicAuthQuota({scope:"mobile-profile-update-ip",
    key:trustedPublicClientIp(request),limit:12,windowSeconds:3600});
  if(!allowed)return fail("Too many profile changes.",429);
  const input=await validateJson(request,profileSchema);
  const profile=await prisma.user.update({where:{id:user.id},
    data:{name:input.name,locale:input.locale},
    select:{id:true,name:true,email:true,locale:true,updatedAt:true}});
  return ok({profile,source:"same_website_user_record"});
 }catch(error){return handleApiError(error);}
}
