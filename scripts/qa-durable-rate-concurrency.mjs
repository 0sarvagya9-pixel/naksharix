import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { randomUUID,createHmac } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import Module,{createRequire} from "node:module";
import { performance } from "node:perf_hooks";

// Strictly disposable database, never live credentials or gateway calls.
const url=new URL(process.env.DATABASE_URL||"postgresql://invalid/invalid");
assert.equal(process.env.CI,"true");
assert.ok(["postgresql:","postgres:"].includes(url.protocol)&&["localhost","127.0.0.1"].includes(url.hostname)&&url.port==="5432"&&url.pathname==="/naksharix"&&url.username==="postgres","DISPOSABLE_LOCALHOST_ONLY");
assert.ok(process.env.JWT_SECRET?.startsWith("isolated-ci-operations-not-a-production-secret-"));
assert.equal(process.env.EMAIL_PROVIDER,"disabled");
process.env.NODE_ENV="test";
const require=createRequire(import.meta.url),ts=require("typescript");
const oldResolve=Module._resolveFilename,oldLoad=Module._load;
Module._resolveFilename=function(name,...args){return oldResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args);};
Module._load=function(name,...args){return name==="server-only"?{}:oldLoad.call(this,name,...args);};
require.extensions[".ts"]=function(module,file){
 const output=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}});
 module._compile(output.outputText,file);
};
const {prisma}=require("@/lib/db");
const {durableRateCount}=require("@/lib/security/durable-rate-counter");
const {durableRateDecision}=require("@/lib/security/durable-rate-contract");
const exec=promisify(execFile);
const worker=process.argv[2]==="--worker";
if(worker){
  const key=process.argv[3];
  assert.match(key,/^qa-durable-rate-[a-f0-9-]{36}$/);
  try{
   const rows=await Promise.all(Array.from({length:12},()=>durableRateCount(key,120)));
   console.log("QA_RATE_WORKER="+JSON.stringify(rows));
  }finally{await prisma.$disconnect();}
}else{
 const key="qa-durable-rate-"+randomUUID(),other=key+":other",collision=key+":collision";
 const digest=value=>createHmac("sha256",process.env.JWT_SECRET).update("naksharix-rate-v2:"+value).digest("hex");
 const id=value=>"rate-v2:"+digest(value);
 const ids=[key,other,collision].map(id);
 try{
  const started=performance.now();
  const runs=await Promise.all(Array.from({length:3},()=>exec(process.execPath,[process.argv[1],"--worker",key],{timeout:45000,maxBuffer:1024*1024,env:process.env})));
  const elapsedMs=Math.round(performance.now()-started);
  const rows=runs.flatMap(run=>{
    const match=run.stdout.split("\n").find(line=>line.startsWith("QA_RATE_WORKER="));
    assert.ok(match,"Missing worker evidence");
    return JSON.parse(match.slice("QA_RATE_WORKER=".length));
  });
  assert.equal(rows.length,36);
  assert.deepEqual(rows.map(row=>row.count).sort((a,b)=>a-b),Array.from({length:36},(_,i)=>i+1),"Lost or duplicate counter increment");
  assert.equal(new Set(rows.map(row=>row.resetAt)).size,1,"One active window across workers");
  assert.equal(rows.filter(row=>durableRateDecision(row.count,row.resetAt,12,Date.now()).allowed).length,12);
  const persisted=await prisma.auditLog.findUniqueOrThrow({where:{id:id(key)}});
  assert.equal(persisted.action,"ops.rate.counter");
  assert.equal(persisted.targetId,digest(key));
  assert.equal(persisted.metadata.count,36);
  assert.ok(!JSON.stringify(persisted).includes(key),"Plaintext quota identity must not be stored");
  const isolated=await durableRateCount(other,120);
  assert.equal(isolated.count,1,"Distinct keys must not consume each other's quota");
  await prisma.auditLog.update({where:{id:id(key)},data:{metadata:{count:36,resetAt:Date.now()-1000}}});
  const reset=await durableRateCount(key,120);
  assert.equal(reset.count,1,"Expired quota window must reset");
  assert.ok(reset.resetAt>Date.now());
  await prisma.auditLog.create({data:{id:id(collision),action:"qa.protected.marker",targetType:"Fixture",targetId:"fixture",metadata:{marker:true}}});
  await assert.rejects(()=>durableRateCount(collision,120));
  const preserved=await prisma.auditLog.findUniqueOrThrow({where:{id:id(collision)}});
  assert.equal(preserved.action,"qa.protected.marker");
  assert.deepEqual(preserved.metadata,{marker:true});
  console.log("DURABLE_RATE_CONCURRENCY_PASS "+JSON.stringify({processes:3,parallelRequests:36,uniqueIncrements:36,allowedAtLimit12:12,deniedAtLimit12:24,elapsedMs,expiredWindowReset:true,distinctKeyIsolation:true,collisionPreserved:true,scope:"disposable PostgreSQL; no production load or gateway"}));
 }finally{
  await prisma.auditLog.deleteMany({where:{id:{in:ids}}});
  await prisma.$disconnect();
 }
}
