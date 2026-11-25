import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
const require=createRequire(import.meta.url),ts=require("typescript");
const oldResolve=Module._resolveFilename,oldLoad=Module._load,oldTS=require.extensions[".ts"],oldFetch=globalThis.fetch;
const env={REPORT_STORAGE_DRIVER:"database",CLOUDFLARE_R2_ACCOUNT_ID:"qa",CLOUDFLARE_R2_ACCESS_KEY_ID:"fake-id",CLOUDFLARE_R2_SECRET_ACCESS_KEY:"fake-key-not-a-credential",CLOUDFLARE_R2_BUCKET:"fixture",AWS_ACCESS_KEY_ID:"fake-id",AWS_SECRET_ACCESS_KEY:"fake-key-not-a-credential",AWS_REGION:"us-east-1",AWS_S3_BUCKET:"fixture"};
Module._resolveFilename=function(name,...args){return oldResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){if(name==="server-only")return {};if(name==="@/lib/env")return {env};return oldLoad.call(this,name,...args);};
require.extensions[".ts"]=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);};
const objects=new Map();let puts=0,preconditions=0;
globalThis.fetch=async(url,init)=>{
 const key=String(url);assert.ok(/^https:\/\/(qa\.r2\.cloudflarestorage\.com|fixture\.s3\.us-east-1\.amazonaws\.com)\//.test(key),"No network allowed");
 assert.equal(init.redirect,"error");assert.ok(init.signal);
 if(init.method==="PUT"){
  assert.equal(init.headers.get("if-none-match"),"*");
  assert.match(init.headers.get("authorization"),/SignedHeaders=[^,]*if-none-match/);
  puts++;
  if(objects.has(key)){preconditions++;return new Response(null,{status:412});}
  objects.set(key,new Uint8Array(init.body));return new Response(null,{status:200});
 }
 assert.equal(init.method,"GET");
 return objects.has(key)?new Response(objects.get(key),{status:200}):new Response(null,{status:404});
};
try{
 const {saveReportPdf,loadReportPdf}=require("@/lib/storage/report-storage");
 const first=Buffer.from("%PDF-1.7\nfixture-one"),second=Buffer.from("%PDF-1.7\nfixture-two");
 const base={reportRequestId:"qa-synthetic",reportSlug:"career-report"};
 const args=s=>({storageDriver:s.storageDriver,storageKey:s.storageKey,databaseBytes:s.bytes,expectedChecksum:s.checksum});
 const db=await saveReportPdf({...base,bytes:first});
 assert.deepEqual(Buffer.from(await loadReportPdf(args(db))),first);
 await assert.rejects(()=>saveReportPdf({...base,bytes:Buffer.from("invalid")}));
 await assert.rejects(()=>loadReportPdf({...args(db),expectedChecksum:"corrupt"}));
 await assert.rejects(()=>loadReportPdf({...args(db),storageDriver:"unknown"}));
 for(const driver of ["r2","s3"]){
  env.REPORT_STORAGE_DRIVER=driver;
  const [a,b]=await Promise.all([saveReportPdf({...base,bytes:first}),saveReportPdf({...base,bytes:second})]);
  assert.notEqual(a.storageKey,b.storageKey,"Concurrent different bytes must use distinct immutable keys");
  assert.deepEqual(Buffer.from(await loadReportPdf(args(a))),first);
  assert.deepEqual(Buffer.from(await loadReportPdf(args(b))),second);
  const replay=await saveReportPdf({...base,bytes:first});
  assert.equal(replay.storageKey,a.storageKey);
  const key=[...objects.keys()].find(k=>k.includes(a.storageKey));
  assert.ok(key);objects.set(key,new Uint8Array(second));
  await assert.rejects(()=>saveReportPdf({...base,bytes:first}),/integrity/);
  await assert.rejects(()=>loadReportPdf(args(a)),/checksum/);
 }
 assert.equal(puts,8);assert.equal(preconditions,4);
 console.log("IMMUTABLE_REPORT_STORAGE_RUNTIME_PASS "+JSON.stringify({drivers:["database","r2","s3"],conditionalPuts:puts,preconditionRejections:preconditions,scope:"actual storage/signing functions with isolated in-memory transport, not live object storage"}));
}finally{globalThis.fetch=oldFetch;Module._resolveFilename=oldResolve;Module._load=oldLoad;if(oldTS)require.extensions[".ts"]=oldTS;else delete require.extensions[".ts"];}
