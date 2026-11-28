import "server-only";
import {prisma} from "@/lib/db";

type Counters={customers:number;unverifiedCustomers:number;pendingReportOrders:number;oldPendingReportOrders:number;paidReportsAwaitingRequest:number;paidPujaWithoutReadyPartner:number;openPujaWithoutSchedule:number;approvedAstrologers:number;pendingAstrologers:number;unpaidConfirmedShopOrders:number};
/** One read-only aggregate statement: no identities, contact details, amounts, birth details or gateway references are returned. */
export async function businessReadiness():Promise<{available:true;counts:Counters}|{available:false}>{
 try{
 const [counts]=await prisma.$queryRaw<Counters[]>`
 SELECT
   (SELECT count(*)::int FROM "User" WHERE role::text='USER') AS "customers",
   (SELECT count(*)::int FROM "User" WHERE role::text NOT IN ('ADMIN','SUPER_ADMIN') AND "emailVerified" IS NULL AND "emailVerifiedAt" IS NULL) AS "unverifiedCustomers",
   (SELECT count(*)::int FROM "Payment" WHERE purpose::text IN ('KUNDLI_REPORT','YEARLY_REPORT','MATCH_REPORT') AND status::text='PENDING') AS "pendingReportOrders",
   (SELECT count(*)::int FROM "Payment" WHERE purpose::text IN ('KUNDLI_REPORT','YEARLY_REPORT','MATCH_REPORT') AND status::text='PENDING' AND "createdAt"<NOW()-interval '24 hours') AS "oldPendingReportOrders",
   (SELECT count(*)::int FROM "Payment" p WHERE p.purpose::text IN ('KUNDLI_REPORT','YEARLY_REPORT','MATCH_REPORT') AND p.provider::text='RAZORPAY' AND p.status::text='PAID' AND p."providerPaymentId" IS NOT NULL AND NOT EXISTS(SELECT 1 FROM "ReportRequest" r WHERE r."paymentId"=p.id)) AS "paidReportsAwaitingRequest",
   (SELECT count(*)::int FROM "Payment" p LEFT JOIN "PujaBookingRequest" b ON b.id=p.metadata->>'pujaBookingId' AND b."userId"=p."userId" LEFT JOIN "PujaPartner" pp ON pp.id=b."partnerId" WHERE p.purpose::text='PUJA_BOOKING' AND p.status::text='PAID' AND (b.id IS NULL OR b."scheduledAt" IS NULL OR pp.id IS NULL OR pp."reviewStatus" IS DISTINCT FROM 'VERIFIED' OR pp."reviewedAt" IS NULL OR pp."evidenceUrl" IS NULL OR NOT COALESCE(b."topicId"=ANY(pp.traditions),false))) AS "paidPujaWithoutReadyPartner",
   (SELECT count(*)::int FROM "PujaBookingRequest" WHERE status IN ('REQUESTED','CONFIRMED','SCHEDULED') AND ("partnerId" IS NULL OR "scheduledAt" IS NULL)) AS "openPujaWithoutSchedule",
   (SELECT count(*)::int FROM "AstrologerProfile" WHERE status::text='APPROVED') AS "approvedAstrologers",
   (SELECT count(*)::int FROM "AstrologerProfile" WHERE status::text='PENDING_REVIEW') AS "pendingAstrologers",
   (SELECT count(*)::int FROM "ShopOrder" WHERE status='CONFIRMED' AND "paymentStatus"='UNPAID') AS "unpaidConfirmedShopOrders"
 `;
 if(!counts||Object.values(counts).some(v=>typeof v!=="number"||!Number.isSafeInteger(v)||v<0))return {available:false};
 return {available:true,counts};
 }catch{return {available:false};}
}
