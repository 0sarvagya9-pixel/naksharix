export type RecoveryIdentity={id:string;providerOrderId:string;amountPaise:number;currency:string};
type GatewayOrder={id?:unknown;receipt?:unknown;amount?:unknown;currency?:unknown;amount_paid?:unknown;amount_due?:unknown;status?:unknown;attempts?:unknown};
type GatewayPayment={id?:unknown;order_id?:unknown;amount?:unknown;currency?:unknown;status?:unknown;amount_refunded?:unknown;refund_status?:unknown};
export type RecoveryDecision={kind:"retry_same_order"}|{kind:"captured";providerPaymentId:string}|{kind:"review"};
// Only an exact, fully observed merchant order may be resumed. Unknown, partial,
// authorized, refunded or inconsistent states require manual review.
export function decideReportOrderRecovery(local:RecoveryIdentity,order:GatewayOrder,collection:{items?:unknown;count?:unknown}):RecoveryDecision{
 const review:RecoveryDecision={kind:"review"};
 if(order.id!==local.providerOrderId||order.receipt!==local.id||order.amount!==local.amountPaise||order.currency!==local.currency)return review;
 if(!Number.isSafeInteger(local.amountPaise)||local.amountPaise<100||!Array.isArray(collection.items)||collection.count!==collection.items.length||order.attempts!==collection.items.length)return review;
 const items=collection.items as GatewayPayment[];
 if(items.some(p=>!p||p.order_id!==local.providerOrderId||typeof p.id!=="string"||!p.id.startsWith("pay_")||p.currency!==local.currency||p.amount!==local.amountPaise||p.amount_refunded!==0||Boolean(p.refund_status)))return review;
 if(new Set(items.map(p=>p.id)).size!==items.length)return review;
 const captured=items.filter(p=>p.status==="captured");
 if(order.status==="paid"&&order.amount_paid===local.amountPaise&&order.amount_due===0&&captured.length===1&&items.every(p=>p.status==="captured"||p.status==="failed"))return {kind:"captured",providerPaymentId:captured[0].id as string};
 if(["created","attempted"].includes(String(order.status))&&order.amount_paid===0&&order.amount_due===local.amountPaise&&items.every(p=>p.status==="failed"))return {kind:"retry_same_order"};
 return review;
}
