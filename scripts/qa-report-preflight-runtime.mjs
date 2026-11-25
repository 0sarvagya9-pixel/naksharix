import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module,{createRequire} from "node:module";
import {randomUUID,createHmac} from "node:crypto";
const db=new URL(process.env.DATABASE_URL||"postgresql://invalid/invalid");
assert.equal(process.env.CI,"true");
assert.ok(["postgresql:","postgres:"].includes(db.protocol)&&["localhost","127.0.0.1"].includes(db.hostname)&&db.port==="5432"&&db.pathname==="/naksharix"&&db.username==="postgres","DISPOSABLE_DATABASE_ONLY");
assert.notEqual(process.env.VERCEL_ENV,"production");
assert.equal(process.env.EMAIL_PROVIDER,"disabled");
assert.ok(process.env.JWT_SECRET);
process.env.NODE_ENV="test";process.env.ASTROLOGY_PROVIDER="own_engine";
globalThis.fetch=async()=>{throw Error("EXTERNAL_NETWORK_FORBIDDEN")};
const require=createRequire(import.meta.url),ts=require("typescript");
let identity=null;
const oldResolve=Module._resolveFilename,oldLoad=Module._load;
Module._resolveFilename=function(name,...args){return oldResolve.call(this,name.startsWith("@/")?path.resolve(name.slice(2)):name,...args)};
Module._load=function(name,...args){
 if(name==="server-only")return {};
 if(name==="@/lib/auth/jwt")return {getCurrentUser:async()=>identity};
 if(name==="razorpay")return class {constructor(){throw Error("MERCHANT_SDK_FORBIDDEN")}};
 return oldLoad.call(this,name,...args);
};
require.extensions[".ts"]=function(module,file){module._compile(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file)};
const {prisma}=require("@/lib/db");
const {POST}=require("@/app/api/report-requests/preflight/route");
const {checkAutomaticInputs,checkNewReportInputs,AUTO_REPORT_SLUGS}=require("@/lib/reports/automatic-report-input");
const {verifyReportPreflight,REPORT_PREFLIGHT_TTL_MS}=require("@/lib/reports/preflight-contract");
const {env}=require("@/lib/env");
const prices={
 "premium-kundli":["kundli-pro","KUNDLI_REPORT",799],
 "couple-kundli":["marriage-report","MATCH_REPORT",699],
 "career-report":["career-report","KUNDLI_REPORT",599],
 "wealth-report":["finance-report","KUNDLI_REPORT",599],
 "love-report":["love-relationship-report","MATCH_REPORT",499],
 "baby-name-report":["baby-name-personalized","KUNDLI_REPORT",399],
 "sade-sati-report":["sade-sati-personalized","KUNDLI_REPORT",399],
 "manglik-kaal-sarp-report":["manglik-kaal-sarp-personalized","KUNDLI_REPORT",499],
 "numerology-lo-shu-report":["numerology-report","KUNDLI_REPORT",399],
 "name-correction-report":["name-correction-personalized","KUNDLI_REPORT",399],
 "yearly-horoscope-report":["yearly-ai","YEARLY_REPORT",999],
 "transit-report":["transit-personalized","YEARLY_REPORT",449],
 "rahu-ketu-report":["rahu-ketu-personalized","KUNDLI_REPORT",399],
 "jupiter-transit-report":["jupiter-transit-personalized","YEARLY_REPORT",399],
 "fortune-report":["fortune-personalized","KUNDLI_REPORT",499]
};
const birth={name:"Synthetic primary person",dateOfBirth:"1990-01-15",timeOfBirth:"10:30",birthPlace:"Delhi, India",latitude:28.6139,longitude:77.209,timezone:5.5};
const partner={...birth,name:"Synthetic second person",dateOfBirth:"1991-02-23",birthPlace:"Mumbai, India",latitude:19.076,longitude:72.8777};
const concern="Synthetic private reflection for admission QA only.";
function extra(slug){
 if(slug==="couple-kundli")return {confirmed:true,partner,partnerPermission:true};
 if(slug==="name-correction-report")return {confirmed:true,romanName:"Asha Test",candidateNames:["Aasha Test"]};
 if(slug==="numerology-lo-shu-report")return {confirmed:true,romanName:"Asha Test"};
 if(slug==="baby-name-report")return {confirmed:true,candidateNames:["Asha"]};
 return {confirmed:true};
}
const ids=[],run=randomUUID();let checks=0,validReports=0,negative=0;
function check(v,m){assert.ok(v,m);checks++}
async function account(label,admin=false){
 const row=await prisma.user.create({data:{name:"Synthetic admission account",email:run+"-"+label+"@example.invalid",role:admin?"ADMIN":"USER",emailVerified:new Date()}});
 ids.push(row.id);return {...row,isAdminLogin:admin,effectiveRole:admin?"ADMIN":"USER"};
}
function body(slug,email,overrides={}){return {reportSlug:slug,deliveryEmail:email,birth,automaticDetails:extra(slug),concern,...overrides}}
async function post(input,raw=false){
 return POST(new Request("http://localhost:3000/api/report-requests/preflight",{method:"POST",headers:{"content-type":"application/json"},body:raw?input:JSON.stringify(input)}));
}
async function denied(input,status,label,raw=false){
 const r=await post(input,raw),j=await r.json();
 check(r.status===status,label+" expected "+status+" got "+r.status);
 check(!j.data?.token,label+" must not issue eligibility");
 check(r.headers.get("cache-control")==="no-store",label+" no cache");negative++;
}
try{
 check(Object.keys(prices).length===15&&AUTO_REPORT_SLUGS.every(s=>Object.hasOwn(prices,s)),"independent published SKU inventory");
 const previousExtras={confirmed:true,partner,partnerPermission:false,romanName:"Synthetic Alias",candidateNames:["Synthetic Candidate"]};
 check(checkAutomaticInputs("premium-kundli",birth,previousExtras).ok,"historical renderer remains compatible");
 check(!checkNewReportInputs("premium-kundli",birth,previousExtras).ok,"new intake refuses unrelated data");
 for(const [i,[slug,[id,purpose,amount]]] of Object.entries(prices).entries()){
  if(i%5===0)identity=await account("valid-"+i);
  const r=await post(body(slug,identity.email)),j=await r.json();
  check(r.status===200&&j.data?.reportId===id&&j.data.price==="INR "+amount&&j.data.expiresInSeconds===1200,slug+" exact price and identity");
  check(r.headers.get("cache-control")==="no-store","no cache");
  const token=j.data.token,[payload,sig]=token.split(".");
  const claim=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));
  check(Object.keys(claim).sort().join(",")==="amountPaise,exp,purpose,reportId,userId,v",slug+" minimal claim");
  check(sig===createHmac("sha256",env.JWT_SECRET).update("naksharix-report-preflight-v1:"+payload).digest("base64url"),slug+" independent signature");
  const exact={userId:identity.id,reportId:id,purpose,amountPaise:amount*100};
  check(verifyReportPreflight(token,exact,env.JWT_SECRET),slug+" token valid");
  for(const wrong of [{...exact,userId:"other-account"},{...exact,reportId:id+"-other"},{...exact,purpose:"SHOP_ORDER"},{...exact,amountPaise:amount*100+1}])
   check(!verifyReportPreflight(token,wrong,env.JWT_SECRET),slug+" cross-binding denied");
  check(!verifyReportPreflight(token,exact,env.JWT_SECRET,claim.exp),slug+" expiry boundary");
  check(claim.exp-Date.now()<=REPORT_PREFLIGHT_TTL_MS&&claim.exp>Date.now(),slug+" short TTL");
  validReports++;
 }
 identity=null;await denied(body("premium-kundli","anonymous@example.invalid"),401,"anonymous");
 identity=await account("admin",true);await denied(body("premium-kundli",identity.email),403,"admin bypass not merchant");
 const neg=[
 ["premium-kundli",{deliveryEmail:"other@example.invalid"},403,"foreign email"],
 ["unknown-report",{},422,"unknown SKU"],
 ["premium-kundli",{concern:"   "},422,"blank concern"],
 ["premium-kundli",{birth:{...birth,dateOfBirth:"1990-02-30"}},422,"invalid civil date"],
 ["premium-kundli",{birth:{...birth,timeOfBirth:"24:00"}},422,"invalid time"],
 ["premium-kundli",{birth:{...birth,timezone:5.123}},422,"invalid offset minutes"],
 ["premium-kundli",{birth:{...birth,latitude:91}},422,"invalid latitude"],
 ["premium-kundli",{automaticDetails:{confirmed:false}},422,"missing consent"],
 ["couple-kundli",{automaticDetails:{confirmed:true}},422,"missing partner"],
 ["couple-kundli",{automaticDetails:{confirmed:true,partner,partnerPermission:false}},422,"missing partner permission"],
 ["numerology-lo-shu-report",{automaticDetails:{confirmed:true}},422,"missing Roman name"],
 ["name-correction-report",{automaticDetails:{confirmed:true,romanName:"Asha",candidateNames:["asha"]}},422,"no distinct alternative"],
 ["baby-name-report",{automaticDetails:{confirmed:true,candidateNames:["आशा"]}},422,"non-Roman candidate"],
 ["premium-kundli",{automaticDetails:{confirmed:true,partner,partnerPermission:true}},422,"irrelevant third-party birth data"],
 ["career-report",{automaticDetails:{confirmed:true,romanName:"Unrelated Name"}},422,"irrelevant name"],
 ["fortune-report",{automaticDetails:{confirmed:true,candidateNames:["Unrelated Name"]}},422,"irrelevant candidate"],
 ["premium-kundli",{extraPrivateField:"not requested"},422,"unknown top-level field"]
 ];
 for(const [i,[slug,overrides,status,label]] of neg.entries()){
  if(i%5===0)identity=await account("negative-"+i);
  await denied(body(slug,identity.email,overrides),status,label);
 }
 await denied("{ malformed",422,"malformed JSON",true);
 identity=await account("quota");
 for(let i=0;i<8;i++){const r=await post(body("premium-kundli",identity.email));check(r.status===200,"eight permitted preflight requests")}
 await denied(body("premium-kundli",identity.email),429,"ninth request rate limited");
 check(await prisma.payment.count({where:{userId:{in:ids}}})===0,"zero payments");
 check(await prisma.reportRequest.count({where:{userId:{in:ids}}})===0,"zero report requests");
 console.log("REPORT_PREFLIGHT_ALL_SKU_RUNTIME_PASS "+JSON.stringify({checks,validReports,negative,rateLimit:"8/60s",paymentRows:0,reportRows:0,scope:"real API handler, disposable database, isolated identity, no merchant SDK or network"}));
}finally{
 await prisma.user.deleteMany({where:{id:{in:ids}}});
 await prisma.$disconnect();
}
