/** A captured provider payment with a refund is not a new paid entitlement. */
export function isUnrefundedCapture(value:unknown,expectedAmountPaise:number):boolean{
 if(!value||typeof value!=="object"||Array.isArray(value)||!Number.isSafeInteger(expectedAmountPaise)||expectedAmountPaise<=0)return false;
 const payment=value as Record<string,unknown>;
 return payment.status==="captured"&&payment.amount===expectedAmountPaise&&payment.amount_refunded===0;
}
