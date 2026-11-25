import assert from "node:assert/strict";
import {performance} from "node:perf_hooks";
const db=new URL(process.env.DATABASE_URL||"postgresql://invalid/invalid");
assert.ok(process.env.CI==="true"&&["localhost","127.0.0.1"].includes(db.hostname)&&db.pathname==="/naksharix"&&db.port==="5432"&&process.env.EMAIL_PROVIDER==="disabled"&&process.env.AI_ASTROLOGER_ENABLED==="false"&&process.env.AI_REPORT_GENERATOR_ENABLED==="false","DISPOSABLE_LOAD_ONLY");
const origin="http://localhost:3000";
const paths=["/api/health","/api/ops/readiness","/reports","/free-kundli","/panchang","/api/puja/calendar"];
const concurrency=12,requests=120;
let cursor=0;const failures=[],stats=new Map(paths.map(p=>[p,[]]));const begin=performance.now();
async function worker(){while(cursor<requests){const n=cursor++,path=paths[n%paths.length],t=performance.now();try{
 const r=await fetch(origin+path,{redirect:"manual",cache:"no-store",signal:AbortSignal.timeout(15000)});const text=await r.text();
 if(r.status!==200||!text.length)throw Error("HTTP_"+r.status);
 if(path==="/api/health"){const v=JSON.parse(text).data;if(v.status!=="ok"||v.checks.database!=="ok")throw Error("DEGRADED");}
 if(path==="/api/ops/readiness"){const v=JSON.parse(text).data;if(v.services.databaseSchema.ready!==true)throw Error("SCHEMA_DEGRADED");}
 stats.get(path).push(performance.now()-t);
 }catch(e){failures.push({path,code:/^HTTP_[0-9]+$|^DEGRADED$|^SCHEMA_DEGRADED$/.test(e.message)?e.message:"NETWORK_OR_PAYLOAD"});}
}}
await Promise.all(Array.from({length:concurrency},worker));
const percentile=(arr,q)=>arr.length?Math.round([...arr].sort((a,b)=>a-b)[Math.ceil(arr.length*q)-1]):null;
const report={concurrency,requests,passed:requests-failures.length,failures,elapsedMs:Math.round(performance.now()-begin),routes:[...stats].map(([path,times])=>({path,passed:times.length,p50:percentile(times,.5),p95:percentile(times,.95),max:percentile(times,1)})),scope:"isolated synthetic CI, no production capacity extrapolation",limitP95Ms:8000};
console.log("ISOLATED_HTTP_LOAD="+JSON.stringify(report));
assert.equal(failures.length,0);assert.ok(report.routes.every(x=>x.passed===20&&x.p95<=8000),"Per-route p95 8s ceiling");
