// The server, not the client, verifies the gateway signature and capture.
// These checks prevent malformed or mismatched acknowledgements from triggering UI success.
function record(value:unknown):Record<string,unknown>|null{
 return typeof value==="object"&&value!==null&&!Array.isArray(value)?value as Record<string,unknown>:null;
}
function identifier(value:unknown):value is string{
 return typeof value==="string"&&value.trim().length>0&&value.length<=256;
}
function rupeesToPaise(value:unknown):number|null{
 if(typeof value!=="string"&&typeof value!=="number")return null;
 const raw=String(value);
 if(!/^\d+(?:\.\d{1,2})?$/.test(raw))return null;
 const [whole,fraction=""]=raw.split(".");
 const paise=Number(whole)*100+Number(fraction.padEnd(2,"0"));
 return Number.isSafeInteger(paise)&&paise>0?paise:null;
}
export function readCheckoutOrderAck(json:unknown,expectedPaise?:number){
 const data=record(record(json)?.data),order=record(data?.order),item=record(data?.item);
 if(!identifier(data?.keyId)||!identifier(data?.paymentId)||!identifier(order?.id)||!order.id.startsWith("order_")||
    typeof order.amount!=="number"||!Number.isSafeInteger(order.amount)||order.amount<=0||order.currency!=="INR"||
    !identifier(item?.name)||rupeesToPaise(item.amount)!==order.amount||
    (expectedPaise!==undefined&&expectedPaise!==order.amount))return null;
 return {keyId:data.keyId,paymentId:data.paymentId,order:{id:order.id,amount:order.amount,currency:order.currency},item:{name:item.name}};
}
type ExpectedPayment={id:string;orderId:string;providerPaymentId:string;purpose:string;amountPaise:number};
export function isVerifiedPaymentAck(json:unknown,expected:ExpectedPayment):boolean{
 const payment=record(record(record(json)?.data)?.payment);
 return Boolean(payment&&payment.id===expected.id&&payment.status==="PAID"&&payment.provider==="RAZORPAY"&&
  payment.currency==="INR"&&payment.purpose===expected.purpose&&payment.providerPaymentId===expected.providerPaymentId&&
  (payment.providerOrderId===undefined||payment.providerOrderId===expected.orderId)&&rupeesToPaise(payment.amount)===expected.amountPaise);
}
