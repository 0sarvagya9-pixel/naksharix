import "server-only";
import {prisma} from "@/lib/db";
import type {Prisma} from "@prisma/client";
import {getPaidReport} from "@/lib/paid-reports";
import {cumulativeSignedRefund} from "@/lib/payments/refund-evidence";
import {matchesSavedKundliPayment,SAVED_KUNDLI_SKU} from "./saved-kundli-contract";
export type SavedKundliAccess="LOCKED"|"UNLOCKED"|"REVIEW";
export async function savedKundliAccessMap(userId:string,ids:string[],tx:Prisma.TransactionClient=prisma){
 const result=new Map<string,SavedKundliAccess>(ids.map(id=>[id,"LOCKED"]));
 if(!ids.length)return result;
 const product=getPaidReport(SAVED_KUNDLI_SKU);
 if(!product||product.purpose!=="KUNDLI_REPORT")throw Error("SAVED_KUNDLI_CATALOGUE_INVALID");
 const payments=await tx.payment.findMany({where:{userId,status:"PAID",OR:ids.map(id=>({metadata:{path:["savedReportId"],equals:id}}))},select:{userId:true,provider:true,purpose:true,status:true,currency:true,amount:true,providerPaymentId:true,metadata:true}});
 for(const payment of payments){
  const savedId=(payment.metadata as Record<string,unknown>|null)?.savedReportId;
  if(typeof savedId!=="string"||!result.has(savedId)||result.get(savedId)==="UNLOCKED")continue;
  result.set(savedId,"REVIEW");
  if(matchesSavedKundliPayment(payment,userId,savedId,product.amount)&&payment.providerPaymentId){
   // Missing/invalid refund evidence fails closed. An old paid record is
   // never presented as a new purchasable item while review is outstanding.
   try{if(await cumulativeSignedRefund(tx,payment.providerPaymentId)===0)result.set(savedId,"UNLOCKED");}catch{/* retain REVIEW */}
  }
 }
 return result;
}
