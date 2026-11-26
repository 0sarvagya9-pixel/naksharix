import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, {createRequire} from "node:module";

// Exercise the real HTTP handlers and input schema. Registry, rate limiter and
// calculation dependencies are isolated: this suite concerns request admission,
// not provider, authentication or commercial integration acceptance.
const require=createRequire(import.meta.url), ts=require("typescript");
const originalResolve=Module._resolveFilename, originalLoad=Module._load;
const originalTs=require.extensions[".ts"];
let claims=0, calculations=0;
const reply=(body,status=200)=>Response.json(body,{status});
const mocks={
  "@/lib/api":{fail:(message,status=400)=>reply({error:message},status),ok:data=>reply({data}),handleApiError:()=>reply({error:"Unexpected error"},500)},
  "@/lib/security/rate-limit":{sharedRateLimitResponse:async()=>null,getRequestIp:()=>"127.0.0.1"},
  "@/lib/business-integrations/ledger":{
    businessEnabled:()=>true,businessPdfEnabled:()=>true,businessSchemaReady:async()=>true,
    claimBusinessCalculation:async()=>{claims++;return {kind:"claimed",tenantId:"test",keyId:"test",requestId:"test",brandName:"Synthetic partner",units:1};},
    finishBusinessCalculation:async()=>true,activeWidgetReservation:async()=>({brandName:"Synthetic partner"})
  },
  "@/lib/business-integrations/calculate":{calculateBusinessResult:async()=>{calculations++;return {reference:"synthetic calculation"};}},
  "@/lib/business-integrations/widget-grant":{
    issueWidgetGrant:()=>({grant:"synthetic-grant"}),
    readWidgetGrant:raw=>raw==="synthetic-grant"?{tenantId:"test",keyId:"test",requestId:"test",location:{}}:null
  }
};
Module._resolveFilename=function(name,...args){return originalResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){if(Object.hasOwn(mocks,name))return mocks[name];return originalLoad.call(this,name,...args);};
require.extensions[".ts"]=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);};

const encoder=new TextEncoder();
const fixture=JSON.stringify({requestId:"cb584343-77dd-49f9-bbc7-29152c0a9b48",scope:"panchang",location:{date:"2026-11-26",latitude:28.61,longitude:77.21,offsetMinutes:330}});
function streamed(chunks,{contentLength,origin}={}){
  let readChunks=0,cancelled=false;
  const body=new ReadableStream({
    pull(controller){if(readChunks===chunks.length){controller.close();return;}controller.enqueue(chunks[readChunks++]);},
    cancel(){cancelled=true;}
  },{highWaterMark:0});
  const headers={"Content-Type":"application/json",...(contentLength===undefined?{}:{"Content-Length":String(contentLength)}),...(origin?{Origin:origin}:{})};
  const request=new Request("http://localhost/api/partner/v1/calculate",{method:"POST",headers,body,duplex:"half"});
  return {request,readChunks:()=>readChunks,cancelled:()=>cancelled};
}
let checks=0;
try{
  const calculate=require("@/app/api/partner/v1/calculate/route"),widget=require("@/app/api/partner/v1/widget/route");

  // No Content-Length: do not drain an arbitrarily large streamed request.
  const stream=streamed(Array.from({length:256},()=>encoder.encode(" ".repeat(1024))));
  assert.equal((await calculate.POST(stream.request)).status,413);
  assert.ok(stream.readChunks()<=9,"Reject and cancel after the first chunk exceeding 8 KiB, without consuming the rest");
  assert.equal(stream.cancelled(),true);assert.equal(claims,0);checks++;

  // An attacker-controlled shorter header cannot override the observed byte cap.
  const lying=streamed(Array.from({length:16},()=>encoder.encode(" ".repeat(1024))),{contentLength:20});
  assert.equal((await calculate.POST(lying.request)).status,413);
  assert.ok(lying.readChunks()<=9);assert.equal(lying.cancelled(),true);assert.equal(claims,0);checks++;

  const declared=streamed([encoder.encode(fixture)],{contentLength:8193});
  assert.equal((await calculate.POST(declared.request)).status,413);
  assert.equal(declared.readChunks(),0);assert.equal(declared.cancelled(),true);checks++;

  const exact=streamed([encoder.encode(fixture+" ".repeat(8192-encoder.encode(fixture).length))]);
  assert.equal((await calculate.POST(exact.request)).status,200);assert.equal(claims,1);assert.equal(calculations,1);checks++;
  const oneOver=streamed([encoder.encode(fixture+" ".repeat(8193-encoder.encode(fixture).length))]);
  assert.equal((await calculate.POST(oneOver.request)).status,413);assert.equal(claims,1);checks++;

  // Fewer than 8,192 JS characters can exceed 8,192 encoded bytes.
  const unicode=JSON.stringify({padding:"अ".repeat(3000)});
  assert.ok(unicode.length<8192&&encoder.encode(unicode).length>8192);
  assert.equal((await calculate.POST(streamed([encoder.encode(unicode)]).request)).status,413);assert.equal(claims,1);checks++;

  assert.equal((await calculate.POST(streamed([encoder.encode("{")]).request)).status,422);checks++;
  assert.equal((await calculate.POST(streamed([new Uint8Array([0xff])]).request)).status,422);checks++;

  // Existing widget behavior keeps its smaller 4 KiB limit and CORS response.
  const widgetPayload=JSON.stringify({grant:"synthetic-grant"});
  const widgetExact=streamed([encoder.encode(widgetPayload+" ".repeat(4096-widgetPayload.length))],{origin:"https://publisher.example"});
  const widgetReply=await widget.POST(widgetExact.request);
  assert.equal(widgetReply.status,200);assert.equal(widgetReply.headers.get("access-control-allow-origin"),"https://publisher.example");checks++;
  const widgetOver=streamed(Array.from({length:32},()=>encoder.encode(" ".repeat(1024))),{origin:"https://publisher.example"});
  assert.equal((await widget.POST(widgetOver.request)).status,413);
  assert.ok(widgetOver.readChunks()<=5);assert.equal(widgetOver.cancelled(),true);checks++;
  assert.equal((await widget.POST(streamed([new Uint8Array([0xff])],{origin:"https://publisher.example"}).request)).status,413);checks++;

  const {readBoundedUtf8Body}=require("@/lib/security/request-body");
  const multilingual=encoder.encode("हिन्दी — A𐍈");
  for(let split=1;split<multilingual.length;split++){
    const body=streamed([multilingual.slice(0,split),multilingual.slice(split)]);
    assert.deepEqual(await readBoundedUtf8Body(body.request,multilingual.length),{ok:true,text:"हिन्दी — A𐍈"});checks++;
  }
  const truncated=streamed([new Uint8Array([0xe0,0xa4])]);
  assert.deepEqual(await readBoundedUtf8Body(truncated.request,20),{ok:false,reason:"invalid_body"});checks++;
  const missing=new Request("http://localhost",{method:"POST"});
  assert.deepEqual(await readBoundedUtf8Body(missing,20),{ok:false,reason:"invalid_body"});checks++;

  console.log("PARTNER_REQUEST_BOUNDARIES_PASS "+JSON.stringify({checks,calculateLimitBytes:8192,widgetLimitBytes:4096,largeStreamChunksRead:stream.readChunks(),largeStreamChunksOffered:256,rejectedBeforeUsage:true,scope:"real HTTP handlers and schema; registry/rate/calculation dependencies isolated, no provider or commercial acceptance"}));
}finally{
  Module._resolveFilename=originalResolve;Module._load=originalLoad;
  if(originalTs)require.extensions[".ts"]=originalTs;else delete require.extensions[".ts"];
}
