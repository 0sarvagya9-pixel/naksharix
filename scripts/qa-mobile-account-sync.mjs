import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import crypto from "node:crypto";
import * as jose from "jose";
const read=p=>fs.readFileSync(p,"utf8");
const source=read("lib/mobile/account-link.ts");
const account=read("app/api/mobile/account/route.ts");
const older=read("app/api/mobile/account/history/route.ts");
const approve=read("app/api/mobile/auth/approve/route.ts");
const middle=read("middleware.ts");
const app=read("mobile-app/src/screens/AccountScreen.tsx");
const client=read("mobile-app/src/auth/mobile-session.ts");
const pkg=JSON.parse(read("mobile-app/package.json"));
assert.ok(pkg.dependencies["expo-secure-store"]?.startsWith("~15."),"Requires Expo SecureStore");
const eas=JSON.parse(read("mobile-app/eas.json"));
for(const profile of ["development","preview","production"])
  assert.equal(eas.build[profile].env.EXPO_PUBLIC_API_URL,"https://www.naksharix.com",
    "The mobile bearer must never be sent through an apex redirect or another host");
const appConfig=JSON.parse(read("mobile-app/app.json"));
assert.ok(appConfig.expo.plugins.includes("expo-secure-store"),"SecureStore native plugin missing");
assert.equal(appConfig.expo.android.versionCode,8);
const accountLinkPage=read("app/mobile/link/page.tsx");
assert.ok(accountLinkPage.includes("getCurrentUser()")&&accountLinkPage.includes("redirectTo=")&&
  accountLinkPage.includes("robots:{index:false,follow:false}"),"Website pairing requires normal verified user auth");

assert.ok(source.includes(".setAudience(MOBILE_AUDIENCE)")&&source.includes("mobileDigest(token)"));
assert.ok(source.includes("consumedAt:null")&&source.includes("claimed.count!==1"));
assert.ok(source.includes('request.headers.get("authorization")')&&!source.includes('request.headers.get("cookie")'));
assert.ok(!middle.includes('"/api/mobile/auth/approve"'),"Browser approval stays CSRF-protected");
for(const name of ["/api/mobile/auth/start","/api/mobile/auth/poll","/api/mobile/auth/logout","/api/mobile/account"])
 assert.ok(middle.includes('"'+name+'"'),"Bearer-only route missing middleware exemption");
assert.ok(approve.includes("getCurrentUser()")&&approve.includes("approveMobilePair("));
assert.ok(account.includes("getMobileAccountUser(request)")&&account.includes("prisma.user.update"));
for(const model of ["kundli","kundliReport","numerologyReport","horoscope","tarotReading","reportRequest","purchasedReport","shopOrder","pujaBookingRequest","consultationBooking","payment","appointment"])
 assert.ok(account.includes("prisma."+model+".findMany({where:{userId:id}"),
   "History must filter by verified user ID: "+model);
assert.ok(older.includes("where:{userId}")&&older.includes("records.slice(0,30)"),"Older records scoped");
for(const section of ["numerologyReports","horoscopeHistory","tarotReadings"]){
 assert.ok(account.includes(section)&&older.includes('case "'+section+'"')&&app.includes('key:"'+section+'"'),"Linked website history missing "+section);
}
assert.ok(client.includes("SecureStore.setItemAsync")&&client.includes('credentials:"omit"'));
assert.ok(app.includes("saveAccessToken(")&&app.includes("deleteAccessToken(")&&app.includes("Load older history"));
const ota=[],sessions=[],users=new Map([["A",{id:"A",email:"a@example.invalid",name:"Test A",role:"USER"}]]);
const valid=(row,where)=>Object.entries(where).every(([k,v])=>k==="expiresAt"?
 row.expiresAt.getTime()>v.gt.getTime():row[k]===v);
const prisma={
 otpToken:{
  async create({data}){const row={id:"otp-"+ota.length,userId:null,consumedAt:null,...data};ota.push(row);return row;},
  async updateMany({where,data}){let count=0;for(const row of ota)if(valid(row,where)){Object.assign(row,data);count++;}return {count};},
  async findFirst({where}){return ota.find(row=>valid(row,where))||null;}
 },
 session:{
  async create({data}){sessions.push({...data,revokedAt:null});return data;},
  async findUnique({where}){return sessions.find(x=>x.tokenHash===where.tokenHash)||null;},
  async updateMany({where,data}){let count=0;for(const row of sessions)if(valid(row,where)){Object.assign(row,data);count++;}return {count};}
 },
 user:{async findUnique({where}){return users.get(where.id)||null;}}
};
const requireMock=name=>name==="server-only"?{}:name==="node:crypto"?crypto:
 name==="jose"?jose:name==="@/lib/db"?{prisma}:null;
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,
 target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
const mod={exports:{}};
new Function("require","module","exports",compiled)(requireMock,mod,mod.exports);
const service=mod.exports;
process.env.JWT_SECRET="fixture-only-not-production-secret-32-characters";
const link=await service.beginMobilePair();
const ticket=new URL(link.approvalUrl).searchParams.get("ticket");
assert.equal(link.expiresInSeconds,300);
assert.equal((await service.pollMobilePair(link.deviceCode)).state,"pending");
assert.ok(!JSON.stringify(ota[0]).includes(ticket)&&!JSON.stringify(ota[0]).includes(link.deviceCode));
assert.equal(await service.approveMobilePair(ticket,"A"),true);
assert.equal(await service.approveMobilePair(ticket,"B"),false);
const issued=await service.pollMobilePair(link.deviceCode);
assert.equal(issued.state,"linked");
assert.equal((await service.pollMobilePair(link.deviceCode)).state,"expired");
const bearer=token=>new Request("https://www.naksharix.com/api/mobile/account",
 {headers:{Authorization:"Bearer "+token}});
assert.equal((await service.getMobileAccountUser(bearer(issued.accessToken))).id,"A");
assert.equal(await service.getMobileAccountUser(new Request("https://www.naksharix.com/api/mobile/account",
 {headers:{cookie:"__Host-naksharix_session=some-website-cookie"}})),null);
assert.equal(await service.getMobileAccountUser(bearer(issued.accessToken+"altered")),null);
sessions[0].userId="B";
assert.equal(await service.getMobileAccountUser(bearer(issued.accessToken)),null);
sessions[0].userId="A";
assert.equal(await service.revokeMobileSession(bearer(issued.accessToken)),true);
assert.equal(await service.getMobileAccountUser(bearer(issued.accessToken)),null);
console.log("NAKSHARIX_MOBILE_ACCOUNT_PAIRING=PASS;SINGLE_USER=PASS;ONE_TIME=PASS;REVOKE=PASS;COOKIE_ISOLATION=PASS");
