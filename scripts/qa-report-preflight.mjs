import assert from "node:assert/strict";
import {issueReportPreflight,verifyReportPreflight,REPORT_PREFLIGHT_TTL_MS} from "../lib/reports/preflight-contract.ts";
const id={userId:"sample",reportId:"kundli-pro",purpose:"KUNDLI_REPORT",amountPaise:79900};
const now=1000000,secret="isolated-qa-secret-never-used-in-production";
const token=issueReportPreflight(id,secret,now);
assert.ok(verifyReportPreflight(token,id,secret,now));
for(const wrong of [{...id,userId:"other"},{...id,reportId:"other"},{...id,purpose:"MATCH_REPORT"},{...id,amountPaise:1}])assert.equal(verifyReportPreflight(token,wrong,secret,now),false);
assert.equal(verifyReportPreflight(token,id,secret,now+REPORT_PREFLIGHT_TTL_MS),false);
assert.equal(verifyReportPreflight(token,id,"wrong-secret",now),false);
assert.equal(verifyReportPreflight(token+"x",id,secret,now),false);
assert.equal(verifyReportPreflight(undefined,id,secret,now),false);
const claim=JSON.parse(Buffer.from(token.split(".")[0],"base64url").toString());
assert.deepEqual(Object.keys(claim).sort(),["amountPaise","exp","purpose","reportId","userId","v"]);
console.log("REPORT_PREFLIGHT_CONTRACT_PASS; no customer data or payment access");

import {readCheckoutOrderAck,isVerifiedPaymentAck} from "../lib/payments/client-checkout-contract.ts";
const orderAck={data:{keyId:"fixture-public-key",paymentId:"internal-fixture",order:{id:"order_fixture",amount:79900,currency:"INR"},item:{name:"Fixture",amount:799}}};
assert.ok(readCheckoutOrderAck(orderAck,79900));
assert.equal(readCheckoutOrderAck(orderAck,80000),null);
for(const wrong of [{amount:0},{amount:79900.5},{currency:"USD"},{id:""}])assert.equal(readCheckoutOrderAck({data:{...orderAck.data,order:{...orderAck.data.order,...wrong}}}),null);
assert.equal(readCheckoutOrderAck({data:{...orderAck.data,item:{name:"Fixture",amount:798}}}),null);
assert.equal(readCheckoutOrderAck(null),null);
const expected={id:"internal-fixture",orderId:"order_fixture",providerPaymentId:"pay_fixture",purpose:"KUNDLI_REPORT",amountPaise:79900};
const payment={id:expected.id,providerOrderId:expected.orderId,providerPaymentId:expected.providerPaymentId,purpose:expected.purpose,amount:"799.00",currency:"INR",provider:"RAZORPAY",status:"PAID"};
assert.ok(isVerifiedPaymentAck({data:{payment}},expected));
const {providerOrderId:omitted,...duplicate}=payment;
assert.ok(isVerifiedPaymentAck({data:{payment:duplicate}},expected));
for(const wrong of [{id:"another"},{providerOrderId:"order_another"},{providerPaymentId:"pay_another"},{purpose:"SHOP_ORDER"},{amount:"798.99"},{amount:"799.001"},{currency:"USD"},{provider:"ADMIN"},{status:"PENDING"},{status:"REFUNDED"}])assert.equal(isVerifiedPaymentAck({data:{payment:{...payment,...wrong}}},expected),false);
assert.equal(isVerifiedPaymentAck({data:{}},expected),false);
assert.equal(isVerifiedPaymentAck(null,expected),false);
console.log("CHECKOUT_ACK_CONTRACT_PASS; synthetic fixtures only");

for(const invalid of [undefined,null,"","pay_","pay_ bad","order_fixture","pay_fixture\n"]){
 assert.equal(isVerifiedPaymentAck({data:{payment:{...payment,providerPaymentId:invalid}}},{...expected,providerPaymentId:invalid}),false);
}
for(const invalid of [undefined,null,"","order_","order_ bad","pay_fixture"]){
 assert.equal(isVerifiedPaymentAck({data:{payment:{...payment,providerOrderId:invalid}}},{...expected,orderId:invalid}),false);
}
for(const invalid of [undefined,null,""," "]){
 assert.equal(isVerifiedPaymentAck({data:{payment:{...payment,id:invalid}}},{...expected,id:invalid}),false);
 assert.equal(isVerifiedPaymentAck({data:{payment:{...payment,purpose:invalid}}},{...expected,purpose:invalid}),false);
}
for(const invalid of [0,-1,79900.5,NaN,Infinity])assert.equal(isVerifiedPaymentAck({data:{payment}},{...expected,amountPaise:invalid}),false);
assert.equal(isVerifiedPaymentAck({data:{payment}},null),false);
for(const id of ["order_","order_ bad","pay_fixture","order_fixture\n"])assert.equal(readCheckoutOrderAck({data:{...orderAck.data,order:{...orderAck.data.order,id}}},79900),null);
console.log("CHECKOUT_ACK_MALFORMED_IDENTITY_GUARDS_PASS; synthetic fixtures only");

import {isUnrefundedCapture} from "../lib/payments/capture-evidence.ts";
import {readFileSync} from "node:fs";
const capturedFixture={status:"captured",amount:79900,amount_refunded:0};
assert.equal(isUnrefundedCapture(capturedFixture,79900),true);
for(const refund of [undefined,null,1,79900,-1,"0",false,NaN,Infinity])assert.equal(isUnrefundedCapture({...capturedFixture,amount_refunded:refund},79900),false);
for(const amount of [0,-1,"79900",79900.1,79899,NaN,Infinity,null,undefined])assert.equal(isUnrefundedCapture({...capturedFixture,amount},79900),false);
for(const amount of [0,-1,NaN,Infinity,79900.5,Number.MAX_SAFE_INTEGER+1])assert.equal(isUnrefundedCapture({...capturedFixture,amount},amount),false);
for(const status of ["authorized","refunded","failed","pending",null,undefined])assert.equal(isUnrefundedCapture({...capturedFixture,status},79900),false);
for(const value of [null,undefined,[],true,79900,"captured"])assert.equal(isUnrefundedCapture(value,79900),false);
const captureWebhook=readFileSync("app/api/payments/razorpay/webhook/route.ts","utf8"),captureServer=readFileSync("lib/revenue.ts","utf8");
assert.ok(captureWebhook.includes("isUnrefundedCapture(payment, Math.round(Number(existingPayment.amount) * 100))"));
assert.ok(captureServer.includes("isUnrefundedCapture(payment, Math.round(expectedAmount * 100))"));
assert.ok(captureWebhook.includes('if (paid) await writeAuditLog({')&&captureWebhook.includes("razorpay_capture_not_finalized_requires_review"));
console.log("UNREFUNDED_CAPTURE_EVIDENCE_PASS; provider and database integration acceptance pending");

const captureVerify=readFileSync("app/api/payments/razorpay/verify/route.ts","utf8"),refundReconcile=readFileSync("lib/payments/purpose-reconciliation.ts","utf8");
const lockPos=captureServer.indexOf("await lockProviderPayment(tx,providerPaymentId)"),receiptPos=captureServer.indexOf("await cumulativeSignedRefund(tx,providerPaymentId)"),claimPos=captureServer.indexOf("const claimed = await tx.payment.updateMany");
assert.ok(lockPos>=0&&receiptPos>lockPos&&claimPos>receiptPos);
assert.ok(captureServer.includes("Prisma.TransactionIsolationLevel.ReadCommitted"));
assert.ok(captureWebhook.indexOf("const fresh = await verifyRazorpayCapturedPayment")<captureWebhook.indexOf("const paid = await finalizePaidPayment"));
assert.ok(captureWebhook.includes("Payment verification temporarily unavailable"));
assert.ok(captureVerify.includes("Payment requires reconciliation before acknowledgement")&&captureVerify.includes("return ok({ payment: current })"));
assert.ok(refundReconcile.includes("if(signedTotal===null)return;")&&refundReconcile.includes("const effectiveRefund=signedTotal;"));
console.log("CAPTURE_REFUND_ORDERING_SOURCE_CONTRACT_PASS; real gateway and concurrent DB acceptance pending");

const reportCreate=readFileSync("app/api/report-requests/route.ts","utf8");
const reportLock=reportCreate.indexOf("await lockProviderPayment(tx,providerPaymentId)"),reportRefund=reportCreate.indexOf("await cumulativeSignedRefund(tx,providerPaymentId)"),reportRowLock=reportCreate.indexOf("FOR UPDATE"),reportRead=reportCreate.indexOf("const current=await tx.payment.findUnique"),reportDuplicate=reportCreate.indexOf("const existing=await tx.reportRequest.findUnique"),reportInsert=reportCreate.indexOf("const row=await tx.reportRequest.create");
assert.ok(reportLock>=0&&reportRefund>reportLock&&reportRowLock>reportRefund&&reportRead>reportRowLock&&reportDuplicate>reportRead&&reportInsert>reportDuplicate);
assert.ok(reportCreate.includes("current.status!==PaymentStatus.PAID")&&reportCreate.includes("current.userId!==user.id")&&reportCreate.includes("current.providerPaymentId!==providerPaymentId")&&reportCreate.includes("if(existing)return {row:existing,created:false}")&&reportCreate.includes("if(!result.created)"));
console.log("PAID_REPORT_REQUEST_REFUND_AND_DUPLICATE_SOURCE_GUARD_PASS");
