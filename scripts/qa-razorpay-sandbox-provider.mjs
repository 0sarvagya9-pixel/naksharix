import assert from "node:assert/strict";
import {createHash, randomUUID} from "node:crypto";
import {appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import {pathToFileURL} from "node:url";

// This utility is deliberately independent of the application database,
// production configuration, SDK checkout, customer data and webhook handlers.
// Test provider mode must receive separate, securely injected credentials.
export function sandboxAvailability(e) {
  const keyId = e.NAKSHARIX_RAZORPAY_TEST_KEY_ID || "";
  const keySecret = e.NAKSHARIX_RAZORPAY_TEST_KEY_SECRET || "";
  const confirmation = e.NAKSHARIX_RAZORPAY_TEST_CONFIRM || "";
  let ready = true;
  try { sandboxCredentials(e); } catch { ready = false; }
  return {
    keyIdPresent: Boolean(keyId),
    keyIdIsTest: /^rzp_test_[A-Za-z0-9]+$/.test(keyId),
    keySecretPresent: Boolean(keySecret),
    confirmationPresent: Boolean(confirmation),
    confirmedTestOnly: confirmation === "test-mode-only",
    ready
  };
}
export function sandboxCredentials(e){
  const id=e.NAKSHARIX_RAZORPAY_TEST_KEY_ID;
  const secret=e.NAKSHARIX_RAZORPAY_TEST_KEY_SECRET;
  if(typeof id!=="string"||!/^rzp_test_[A-Za-z0-9]+$/.test(id)||typeof secret!=="string"||secret.length<8||/[\r\n]/.test(secret))
    throw Error("SANDBOX_TEST_CREDENTIALS_REQUIRED");
  if(e.NAKSHARIX_RAZORPAY_TEST_CONFIRM!=="test-mode-only")throw Error("SANDBOX_EXPLICIT_CONFIRMATION_REQUIRED");
  if(e.VERCEL_ENV==="production")throw Error("SANDBOX_PRODUCTION_RUNTIME_FORBIDDEN");
  return {id,secret};
}
export function sandboxEvidence(kind, result, context={}, at=new Date()) {
  const evidence={schemaVersion:1,kind,observedAt:at.toISOString(),
    sourceSha:/^[a-f0-9]{40}$/.test(context.GITHUB_SHA??"")?context.GITHUB_SHA:null,
    runId:/^\d{1,30}$/.test(context.GITHUB_RUN_ID??"")?context.GITHUB_RUN_ID:null,
    runAttempt:/^\d{1,5}$/.test(context.GITHUB_RUN_ATTEMPT??"")?Number(context.GITHUB_RUN_ATTEMPT):null,
    scope:["repository","protected-development"].includes(context.NAKSHARIX_RAZORPAY_TEST_SCOPE)?context.NAKSHARIX_RAZORPAY_TEST_SCOPE:"isolated-local",
    fullMerchantToInboxAccepted:false};
  if(kind==="availability") {
    const keys=["keyIdPresent","keyIdIsTest","keySecretPresent","confirmationPresent","confirmedTestOnly","ready"];
    if(!keys.every(key=>typeof result[key]==="boolean"))throw Error("SANDBOX_INVALID_EVIDENCE");
    evidence.configuration=Object.fromEntries(keys.map(key=>[key,result[key]]));
    evidence.disposition=result.ready?"CONFIGURED_NOT_EXECUTED":"BLOCKED_TEST_CONFIGURATION";
  } else if(kind==="provider-order") {
    if(result.mode!=="provider-test"||result.orderCreated!==true||result.orderReadback!==true||result.paymentCaptured!==false||result.amountPaise!==100||result.currency!=="INR"||![result.receiptDigest,result.orderDigest].every(value=>typeof value==="string"&&/^[a-f0-9]{64}$/.test(value)))throw Error("SANDBOX_INVALID_EVIDENCE");
    evidence.disposition="TEST_ORDER_CREATE_READBACK_ONLY";
    evidence.provider={mode:"provider-test",orderCreated:true,orderReadback:true,amountPaise:100,currency:"INR",paymentCaptured:false,receiptDigest:result.receiptDigest,orderDigest:result.orderDigest};
  } else if(kind==="error") {
    evidence.disposition="NOT_QUALIFIED";
    evidence.errorCode=typeof result.code==="string"&&/^SANDBOX_[A-Z0-9_]+$/.test(result.code)?result.code:"SANDBOX_CHECK_FAILED";
  } else throw Error("SANDBOX_INVALID_EVIDENCE_KIND");
  return evidence;
}
export function writeSandboxEvidence(directory,kind,result,context={}) {
  if(!directory)return;
  const evidence=sandboxEvidence(kind,result,context);
  try {mkdirSync(directory,{recursive:true,mode:0o700});writeFileSync(path.join(directory,kind+".json"),JSON.stringify(evidence,null,2)+"\n",{mode:0o600,flag:"wx"});}
  catch {throw Error("SANDBOX_EVIDENCE_WRITE_FAILED");}
}
export async function sandboxOrderProbe(e,transport=fetch,makeReceipt=()=>("nxqa_"+randomUUID().replaceAll("-","").slice(0,24))){
  const {id,secret}=sandboxCredentials(e);
  const receipt=makeReceipt();
  if(!/^nxqa_[A-Za-z0-9]{12,30}$/.test(receipt))throw Error("SANDBOX_INVALID_RECEIPT");
  const endpoint="https://api.razorpay.com/v1/orders";
  const headers={Authorization:"Basic "+Buffer.from(id+":"+secret).toString("base64"),"Content-Type":"application/json",Accept:"application/json"};
  async function request(url,method,body){
    let response;
    try{response=await transport(url,{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:"error",cache:"no-store",signal:AbortSignal.timeout(20000)});}
    catch{throw Error("SANDBOX_TRANSPORT_FAILED_NO_AUTOMATIC_RETRY");}
    if(!response.ok)throw Error("SANDBOX_HTTP_"+response.status);
    try{return await response.json();}catch{throw Error("SANDBOX_INVALID_RESPONSE");}
  }
  // INR 1 is a simulated test order only. No payment method, checkout,
  // capture, refund, settlement, email or application records are created.
  const order=await request(endpoint,"POST",{amount:100,currency:"INR",receipt,notes:{purpose:"NAKSHARIX sandbox QA only"}});
  if(typeof order?.id!=="string"||!/^order_[A-Za-z0-9]+$/.test(order.id))throw Error("SANDBOX_INVALID_ORDER_ID");
  function exact(row){
    return row?.id===order.id&&row?.entity==="order"&&row?.amount===100&&row?.currency==="INR"&&row?.receipt===receipt&&row?.status==="created"&&row?.amount_paid===0&&row?.amount_due===100;
  }
  if(!exact(order))throw Error("SANDBOX_CREATE_MISMATCH");
  const observed=await request(endpoint+"/"+encodeURIComponent(order.id),"GET");
  if(!exact(observed))throw Error("SANDBOX_READBACK_MISMATCH");
  return {mode:"provider-test",orderCreated:true,orderReadback:true,amountPaise:100,currency:"INR",paymentCaptured:false,receiptDigest:createHash("sha256").update(receipt).digest("hex"),orderDigest:createHash("sha256").update(order.id).digest("hex")};
}
export async function selfTest(){
  // Synthetic credentials are used exclusively with injected fake transport.
  const valid={NAKSHARIX_RAZORPAY_TEST_KEY_ID:"rzp_test_SYNTHETIC",NAKSHARIX_RAZORPAY_TEST_KEY_SECRET:"synthetic-fixture-only",NAKSHARIX_RAZORPAY_TEST_CONFIRM:"test-mode-only"};
  const receipt="nxqa_synthetic12345678";
  const calls=[];
  const good={id:"order_SYNTHETIC",entity:"order",amount:100,currency:"INR",receipt,status:"created",amount_paid:0,amount_due:100};
  const reply=(o,status=200)=>new Response(JSON.stringify(o),{status,headers:{"content-type":"application/json"}});
  const transport=async(url,init)=>{calls.push({url,method:init.method,body:init.body,redirect:init.redirect});return reply(good)};
  let checks=0;
  for(const invalid of [{...valid,NAKSHARIX_RAZORPAY_TEST_KEY_ID:["rzp","live","SYNTHETIC"].join("_")},{...valid,NAKSHARIX_RAZORPAY_TEST_KEY_ID:"test"},{...valid,NAKSHARIX_RAZORPAY_TEST_KEY_SECRET:""},{...valid,NAKSHARIX_RAZORPAY_TEST_CONFIRM:""},{...valid,VERCEL_ENV:"production"},{RAZORPAY_KEY_ID:["rzp","live","SYNTHETIC"].join("_"),RAZORPAY_KEY_SECRET:"synthetic-fixture-only"}]){
    await assert.rejects(sandboxOrderProbe(invalid,transport,()=>receipt));checks++;
  }
  assert.equal(calls.length,0);checks++;
  const out=await sandboxOrderProbe(valid,transport,()=>receipt);
  assert.equal(out.orderCreated,true);assert.equal(out.orderReadback,true);assert.equal(out.paymentCaptured,false);checks++;
  assert.deepEqual(calls.map(x=>x.method),["POST","GET"]);checks++;
  assert.equal(calls[0].url,"https://api.razorpay.com/v1/orders");assert.equal(calls[1].url,"https://api.razorpay.com/v1/orders/order_SYNTHETIC");checks++;
  assert.equal(JSON.parse(calls[0].body).amount,100);assert.equal(calls[0].redirect,"error");checks++;
  await assert.rejects(sandboxOrderProbe(valid,async()=>reply({...good,amount:101}),()=>receipt),/CREATE_MISMATCH/);checks++;
  let n=0;await assert.rejects(sandboxOrderProbe(valid,async()=>reply(++n===1?good:{...good,status:"paid"}),()=>receipt),/READBACK_MISMATCH/);checks++;
  let attempts=0;await assert.rejects(sandboxOrderProbe(valid,async()=>{attempts++;throw Error("synthetic network failure")},()=>receipt),/NO_AUTOMATIC_RETRY/);assert.equal(attempts,1);checks++;
  await assert.rejects(sandboxOrderProbe(valid,async()=>reply({},401),()=>receipt),/HTTP_401/);checks++;
  await assert.rejects(sandboxOrderProbe(valid,transport,()=>"invalid/receipt"),/INVALID_RECEIPT/);checks++;
  await assert.rejects(sandboxOrderProbe(valid,async()=>reply({...good,id:"https://example.invalid"}),()=>receipt),/INVALID_ORDER_ID/);checks++;
  const context={...valid,GITHUB_SHA:"a".repeat(40),GITHUB_RUN_ID:"123456",GITHUB_RUN_ATTEMPT:"1",NAKSHARIX_RAZORPAY_TEST_SCOPE:"repository"};
  const readiness=sandboxEvidence("availability",{...sandboxAvailability(valid),secret:"should-not-be-recorded"},context,new Date("2026-11-28T00:00:00Z"));
  assert.equal(readiness.disposition,"CONFIGURED_NOT_EXECUTED");assert.equal(readiness.fullMerchantToInboxAccepted,false);assert.equal(readiness.sourceSha,context.GITHUB_SHA);checks++;
  assert.equal(JSON.stringify(readiness).includes(valid.NAKSHARIX_RAZORPAY_TEST_KEY_ID),false);assert.equal(JSON.stringify(readiness).includes(valid.NAKSHARIX_RAZORPAY_TEST_KEY_SECRET),false);assert.equal(JSON.stringify(readiness).includes("should-not-be-recorded"),false);checks++;
  const missing=sandboxEvidence("availability",sandboxAvailability({}),{});assert.equal(missing.disposition,"BLOCKED_TEST_CONFIGURATION");assert.equal(missing.sourceSha,null);checks++;
  const orderEvidence=sandboxEvidence("provider-order",{...out,rawResponse:{secret:"untrusted"}},context);assert.equal(orderEvidence.disposition,"TEST_ORDER_CREATE_READBACK_ONLY");assert.equal(orderEvidence.provider.paymentCaptured,false);assert.equal(JSON.stringify(orderEvidence).includes("untrusted"),false);checks++;
  assert.throws(()=>sandboxEvidence("provider-order",{...out,paymentCaptured:true}),/INVALID_EVIDENCE/);assert.throws(()=>sandboxEvidence("availability",{...sandboxAvailability(valid),ready:"true"}),/INVALID_EVIDENCE/);checks++;
  assert.equal(sandboxEvidence("error",{code:"private provider body"}).errorCode,"SANDBOX_CHECK_FAILED");checks++;
  const directory=mkdtempSync(path.join(tmpdir(),"naksharix-sandbox-evidence-"));
  try {writeSandboxEvidence(directory,"availability",sandboxAvailability(valid),context);const saved=JSON.parse(readFileSync(path.join(directory,"availability.json"),"utf8"));assert.equal(saved.runId,"123456");assert.equal(saved.configuration.ready,true);assert.throws(()=>writeSandboxEvidence(directory,"availability",sandboxAvailability(valid),context),/EVIDENCE_WRITE_FAILED/);checks++;}finally{rmSync(directory,{recursive:true,force:true});}
  return {mode:"isolated-transport-fixtures",checks,providerNetworkCalls:0,realPayments:0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const evidenceDirectory=process.env.NAKSHARIX_RAZORPAY_TEST_EVIDENCE_DIR;
  try{
    const args=process.argv.slice(2);
    if (args.length === 1 && args[0] === "--check-availability") {
      const availability = sandboxAvailability(process.env);
      writeSandboxEvidence(evidenceDirectory,"availability",availability,process.env);
      console.log("RAZORPAY_TEST_RUNTIME=" + JSON.stringify(availability));
      if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, "ready=" + availability.ready + "\n");
    }
    else if(args.length===1&&args[0]==="--provider-test-order") {
      // Refuse stale output before any provider mutation. A lost response is
      // never automatically retried merely to obtain another evidence file.
      if(evidenceDirectory&&existsSync(path.join(evidenceDirectory,"provider-order.json")))throw Error("SANDBOX_EXISTING_ORDER_RECEIPT_REVIEW_REQUIRED");
      const result=await sandboxOrderProbe(process.env);
      writeSandboxEvidence(evidenceDirectory,"provider-order",result,process.env);
      console.log("RAZORPAY_SANDBOX_ORDER_PROBE="+JSON.stringify(result));
    }
    else if(args.length===0||(args.length===1&&args[0]==="--self-test"))console.log("RAZORPAY_SANDBOX_CONTRACT_PASS="+JSON.stringify(await selfTest()));
    else throw Error("SANDBOX_UNKNOWN_ARGUMENT");
  }catch(error){
    // Print a controlled category only. Never print provider bodies, headers,
    // credentials, stack traces, customer data or raw provider identifiers.
    const code=error instanceof Error&&/^SANDBOX_[A-Z0-9_]+$/.test(error.message)?error.message:"SANDBOX_CHECK_FAILED";
    try{writeSandboxEvidence(evidenceDirectory,"error",{code},process.env);}catch{/* Preserve original controlled failure; never disclose filesystem/provider details. */}
    console.error(code);process.exitCode=1;
  }
}
