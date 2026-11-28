import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript'),root=process.cwd(),cache=new Map();
const baseline=process.env.CONSULTATION_ADMIN_BASELINE;if(baseline&&!/^[a-f0-9]{7,40}$/.test(baseline))throw Error('Use an immutable baseline');
const initialTime=new Date('2026-11-27T12:00:00.000Z'),clone=value=>structuredClone(value);
let record,admin=true,role='SUPER_ADMIN',reads=0,writes=0,audits=[],barrier=false,releaseRead,readGate,tail=Promise.resolve(),injectPayment=false;
const base={id:'synthetic-consultation',status:'REQUESTED',paymentStatus:'PENDING',metadata:{retained:true},updatedAt:initialTime};
function reset(){record=clone(base);reads=0;writes=0;audits=[];admin=true;role='SUPER_ADMIN';barrier=false;injectPayment=false;tail=Promise.resolve();readGate=new Promise(resolve=>{releaseRead=resolve;});}
const prisma={consultationBooking:{
 findUnique:async()=>{const snapshot=clone(record);reads++;if(barrier){if(reads===2)releaseRead();await readGate;}if(injectPayment){record={...record,paymentStatus:'PAID',updatedAt:new Date(initialTime.getTime()+1000)};injectPayment=false;}return snapshot;},
 findUniqueOrThrow:async()=>clone(record),
 update:async({data})=>{writes++;record={...record,...data,updatedAt:new Date()};return clone(record);},
 updateMany:async({where,data})=>{if(where.id!==record.id||new Date(where.updatedAt).getTime()!==record.updatedAt.getTime()||where.status!==record.status||where.paymentStatus!==record.paymentStatus)return {count:0};writes++;record={...record,...data};return {count:1};}
},adminActionLog:{create:async({data})=>{audits.push(data);return data;}},$transaction:callback=>{const run=tail.then(()=>callback(prisma));tail=run.catch(()=>undefined);return run;}};
const overrides={'server-only':{},'@/lib/db':{prisma},'@/lib/auth/jwt':{getCurrentUser:async()=>admin?{id:'synthetic-admin',role}:null},'@/lib/api':{ok:data=>Response.json({data}),fail:(error,status)=>Response.json({error},{status}),validateJson:async(request,schema)=>schema.parse(await request.json()),handleApiError:()=>Response.json({error:'Invalid request'},{status:422})}};
function resolve(name,file){const base=name.startsWith('@/')?path.join(root,name.slice(2)):path.resolve(path.dirname(file),name);const found=['','.ts','.tsx','.js'].map(ext=>base+ext).find(existsSync);if(!found)throw Error('Cannot resolve '+name);return found;}
function load(file){if(cache.has(file))return cache.get(file).exports;const loaded={exports:{}};cache.set(file,loaded);const local=name=>Object.hasOwn(overrides,name)?overrides[name]:name.startsWith('@/')||name.startsWith('.')?load(resolve(name,file)):require(name);const relative=path.relative(root,file),source=baseline&&relative==='app/api/admin/bookings/status/route.ts'?execFileSync('git',['show',baseline+':'+relative],{encoding:'utf8'}):readFileSync(file,'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function('require','module','exports',code)(local,loaded,loaded.exports);return loaded.exports;}
const route=load(path.join(root,'app/api/admin/bookings/status/route.ts'));
const input=extra=>({bookingId:record.id,expectedUpdatedAt:record.updatedAt.toISOString(),status:'ACCEPTED',paymentStatus:'PENDING',meetingLink:'https://meet.google.com/abc-defg-hij',adminNote:'Recorded synthetic note',...extra});
const submit=body=>route.POST(new Request('https://naksharix-fixture.invalid/api/admin/bookings/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
let cases=0;
reset();barrier=true;const left=input({adminNote:'First administrator note'}),right=input({status:'REJECTED',adminNote:'Second administrator note'});const responses=await Promise.all([submit(left),submit(right)]);
if(baseline){assert.deepEqual(responses.map(r=>r.status),[200,200]);assert.equal(writes,2);assert.equal(audits.length,2);assert.equal(record.metadata.adminNote,'Second administrator note');console.log('CONSULTATION_BASELINE_SAME_SNAPSHOT_LOST_UPDATE_REPRODUCED '+JSON.stringify({statuses:responses.map(r=>r.status),writes,audits:audits.length}));}
else {
 assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);assert.equal(writes,1);assert.equal(audits.length,1);assert.equal(record.metadata.adminNote,'First administrator note');assert.equal(record.status,'ACCEPTED');assert.equal(record.metadata.retained,true);assert.ok(record.updatedAt>initialTime);cases++;
 let body=await responses.find(r=>r.status===200).json();assert.equal(body.data.booking.updatedAt,record.updatedAt.toISOString());cases++;
 barrier=false;let response=await submit(right);assert.equal(response.status,409);assert.equal(writes,1);assert.equal(audits.length,1);cases++;
 response=await submit(input({adminNote:'Follow-up from the fresh snapshot'}));assert.equal(response.status,200);assert.equal(writes,2);assert.equal(record.metadata.adminNote,'Follow-up from the fresh snapshot');cases++;
 reset();injectPayment=true;response=await submit(input());assert.equal(response.status,409);assert.equal(writes,0);assert.equal(record.paymentStatus,'PAID');assert.equal(audits.length,0);cases++;
 for(const extra of [{expectedUpdatedAt:undefined},{expectedUpdatedAt:'invalid'},{meetingLink:'https://unapproved.example.invalid/room'},{status:'INVALID'},{paymentStatus:'INVALID'}]){reset();response=await submit(input(extra));assert.equal(response.status,422);assert.equal(writes,0);cases++;}
 reset();admin=false;response=await submit(input());assert.equal(response.status,403);assert.equal(writes,0);cases++;
 reset();role='USER';response=await submit(input());assert.equal(response.status,403);assert.equal(writes,0);cases++;
 reset();record.updatedAt=new Date(Date.now()+60000);const previous=record.updatedAt.getTime();response=await submit(input());assert.equal(response.status,200);assert.equal(record.updatedAt.getTime(),previous+1);cases++;
 console.log('CONSULTATION_ADMIN_CONCURRENCY_PASS '+JSON.stringify({cases,scope:'actual route and schema with an isolated in-memory CAS and serialized transaction adapter; same-snapshot admin race, intervening payment, stale retry, latest-snapshot follow-up, role/link/schema and monotonic timestamp; no real database or payment'}));
}
