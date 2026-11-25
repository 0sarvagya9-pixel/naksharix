import "server-only";
import type { ReportRequest } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getManualReport } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
import { cumulativeSignedRefund } from "@/lib/payments/refund-evidence";

type ReportIdentity=Pick<ReportRequest,"id"|"reportSlug"|"userId"|"paymentId"|"paymentStatus"|"status">;

/** Resolve old catalogue aliases before enforcing the fixed-price contract. */
export function fixedReportCheckout(slug:string){
  return getManualReportCheckout(getManualReport(slug)?.slug??slug);
}

/** Request-level PAID is not payment evidence. Use the exact current purchase
 * and durable signed receipts, including receipts received before reconciliation.
 * A partial/ambiguous refund requires accounting review, not a new delivery. */
export async function hasCurrentPaidReportEntitlement(row:ReportIdentity):Promise<boolean>{
  const product=fixedReportCheckout(row.reportSlug);
  if(!product||!row.userId||!row.paymentId||row.paymentStatus!=="PAID"||row.status==="CANCELLED")return false;
  try{
    const current=await prisma.reportRequest.findUnique({where:{id:row.id},select:{
      userId:true,paymentId:true,paymentStatus:true,status:true,reportSlug:true,
      payment:{select:{id:true,userId:true,status:true,provider:true,purpose:true,currency:true,amount:true,providerPaymentId:true,metadata:true}}
    }});
    if(!current||current.userId!==row.userId||current.paymentId!==row.paymentId||current.reportSlug!==row.reportSlug||
       current.paymentStatus!=="PAID"||current.status==="CANCELLED")return false;
    const payment=current.payment,metadata=payment?.metadata as Record<string,unknown>|null;
    if(!payment||payment.id!==row.paymentId||payment.userId!==row.userId||payment.status!=="PAID"||
       payment.provider!=="RAZORPAY"||payment.currency!=="INR"||!payment.providerPaymentId||
       String(payment.purpose)!==product.purpose||Number(payment.amount)!==product.amount||metadata?.reportId!==product.reportId)return false;
    return (await cumulativeSignedRefund(prisma,payment.providerPaymentId))===0;
  }catch{return false;}
}
