import "server-only";
import type {Prisma} from "@prisma/client";
import {prisma} from "@/lib/db";
/** Persist only normalized signed refund receipts, never the raw webhook payload.
 * This also retains a refund arriving before a subscription cycle's payment row. */
const receiptAction="payment.razorpay_refund_processed_receipt";
const paymentType="RazorpayPayment";
export async function lockProviderPayment(tx:Prisma.TransactionClient,paymentId:string){
 await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${paymentId}),hashtext('naksharix-razorpay-refund-v1'))::text`;
}
export async function cumulativeSignedRefund(tx:Prisma.TransactionClient,paymentId:string){
 const rows=await tx.auditLog.findMany({where:{action:receiptAction,targetType:paymentType,targetId:paymentId},select:{metadata:true}});
 let total=0;
 for(const row of rows){
  const amount=(row.metadata as {amountPaise?:unknown}|null)?.amountPaise;
  if(typeof amount!=="number"||!Number.isSafeInteger(amount)||amount<=0||!Number.isSafeInteger(total+amount))throw Error("RAZORPAY_REFUND_RECEIPT_INVALID");
  total+=amount;
 }
 return total;
}
/** Caller must have verified the raw webhook signature before invoking. */
export async function recordSignedRefundReceipt(refund:{id?:string;payment_id?:string;amount?:number;status?:string}){
 if(refund.status!=="processed"||typeof refund.id!=="string"||!/^rfnd_[A-Za-z0-9]{5,80}$/.test(refund.id)||typeof refund.payment_id!=="string"||!/^pay_[A-Za-z0-9]{5,80}$/.test(refund.payment_id)||!Number.isSafeInteger(refund.amount)||Number(refund.amount)<=0)return null;
 const paymentId=refund.payment_id,receiptId="razorpay-refund:"+refund.id,amount=Number(refund.amount);
 return prisma.$transaction(async tx=>{
  await lockProviderPayment(tx,paymentId);
  const receipt=await tx.auditLog.upsert({where:{id:receiptId},create:{id:receiptId,action:receiptAction,targetType:paymentType,targetId:paymentId,metadata:{amountPaise:amount}},update:{},select:{action:true,targetType:true,targetId:true,metadata:true}});
  if(receipt.action!==receiptAction||receipt.targetType!==paymentType||receipt.targetId!==paymentId||(receipt.metadata as {amountPaise?:unknown}|null)?.amountPaise!==amount)throw Error("RAZORPAY_REFUND_RECEIPT_CONFLICT");
  return cumulativeSignedRefund(tx,paymentId);
 });
}
