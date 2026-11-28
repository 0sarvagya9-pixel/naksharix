import "server-only";
import {razorpay} from "@/lib/payments/razorpay";
import {decideReportOrderRecovery,type RecoveryDecision} from "@/lib/payments/report-order-recovery-contract";
export async function checkExistingReportOrder(payment:{id:string;providerOrderId:string|null;amount:unknown;currency:string}):Promise<RecoveryDecision>{
 if(!razorpay||!payment.providerOrderId||!payment.providerOrderId.startsWith("order_"))return {kind:"review"};
 try{
  const amountPaise=Math.round(Number(payment.amount)*100);
  const order=await razorpay.orders.fetch(payment.providerOrderId);
  const collection=await razorpay.orders.fetchPayments(payment.providerOrderId);
  return decideReportOrderRecovery({id:payment.id,providerOrderId:payment.providerOrderId,amountPaise,currency:payment.currency},order,collection);
 }catch{return {kind:"review"};}
}
