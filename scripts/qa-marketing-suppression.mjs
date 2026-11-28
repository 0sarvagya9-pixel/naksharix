import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { marketingConsentVersion } from "../lib/marketing-consent.ts";
import { auditConsentDatabase, reconcileMarketingConsent } from "./audit-marketing-consent.mjs";

const snapshotAt=new Date(Date.now()-1000).toISOString();
const captured={listId:27,capturedAt:snapshotAt,count:0,contacts:[]};
const earlier=new Date(Date.now()-60000);
const row=(name,change={})=>({emailAtConsent:name+"@merchant-fixture.org",source:"website-email-updates",interest:"career",
  confirmedAt:earlier,revokedAt:null,consentVersion:marketingConsentVersion,user:{role:"USER",email:name+"@merchant-fixture.org",emailVerified:earlier},...change});
const contact=(name,change={})=>({email:name+"@merchant-fixture.org",emailBlacklisted:false,listUnsubscribed:[],listIds:[27],...change});
const cases=[
 ["permitted",{},{},"matchedAtSnapshot"],
 ["withdrawn",{revokedAt:earlier},{},"websiteWithdrawn"],
 ["provider-optout",{},{emailBlacklisted:true},"providerSuppressed"],
 ["list-optout",{},{listUnsubscribed:[27]},"providerSuppressed"],
 ["unknown",{},{listUnsubscribed:undefined},"providerStateUnknown"],
 ["different-list",{},{listIds:[99]},"providerStateUnknown"],
 ["changed",{user:{role:"USER",email:"new@merchant-fixture.org",emailVerified:earlier}},{},"accountAddressChanged"],
 ["admin",{user:{role:"ADMIN",email:"admin@merchant-fixture.org",emailVerified:earlier}},{},"excludedAccount"],
 ["old-consent",{consentVersion:"old"},{},"consentRequiresReview"],
 ["recent",{confirmedAt:new Date()},{},"websiteChangedAfterSnapshot"],
 ["excluded",{},{},"excludedAccount"],
 ["unverified",{user:{role:"USER",email:"unverified@merchant-fixture.org"}},{},"unverifiedAccount"]
];
for (const [name,local,remote,reason] of cases) {
  const result=reconcileMarketingConsent([row(name,local)],{...captured,count:1,contacts:[contact(name,remote)]},["excluded@merchant-fixture.org"]);
  assert.deepEqual(result.reasons,{[reason]:1},name);
  assert.equal(result.sendAuthorized,false);
  assert.ok(!JSON.stringify(result).includes("@"));
}
assert.deepEqual(reconcileMarketingConsent([row("missing")],captured).reasons,{providerRecordMissing:1});
assert.deepEqual(reconcileMarketingConsent([row("a"),row("a")],{...captured,count:1,contacts:[contact("a")]}).reasons,{duplicateIdentity:2});
assert.deepEqual(reconcileMarketingConsent([row("a")],{...captured,count:2,contacts:[contact("a"),contact("a")]}).reasons,{duplicateIdentity:1});
assert.equal(reconcileMarketingConsent([],{...captured,count:1,contacts:[contact("a")]}).providerOnlyAddresses,1);
assert.throws(()=>reconcileMarketingConsent([],{...captured,count:55}));
assert.throws(()=>reconcileMarketingConsent([],{...captured,capturedAt:"bad"}));
console.log("PASS 18 offline marketing consent and suppression scenarios; aggregate output only.");

if (process.argv.includes("--database")) {
  const url=new URL(process.env.DATABASE_URL??"");
  assert.deepEqual([process.env.CI,url.hostname,url.port,url.pathname],["true","localhost","5432","/naksharix"]);
  const {PrismaClient}=await import("@prisma/client");const db=new PrismaClient();
  const name=randomUUID(), r=row(name);
  const user=await db.user.create({data:{email:r.emailAtConsent,name:"Synthetic Consent",emailVerified:earlier}});
  const snapshot={...captured,count:1,contacts:[contact(name)]};
  try {
    const {user:_user,...fields}=r;
    const before=await auditConsentDatabase(db,snapshot,[]);
    await db.marketingConsent.create({data:{...fields,userId:user.id,locale:"en"}});
    const active=await auditConsentDatabase(db,snapshot,[]);
    assert.equal((active.reasons.matchedAtSnapshot??0)-(before.reasons.matchedAtSnapshot??0),1);
    await db.marketingConsent.update({where:{userId:user.id},data:{revokedAt:new Date()}});
    const revoked=await auditConsentDatabase(db,snapshot,[]);
    assert.equal(revoked.reasons.matchedAtSnapshot??0,before.reasons.matchedAtSnapshot??0);
    assert.equal(revoked.providerSuppressionReview-before.providerSuppressionReview,1);
    console.log("PASS disposable PostgreSQL opt-in and withdrawal compared to same external snapshot; no provider calls.");
  } finally {await db.user.delete({where:{id:user.id}});await db.$disconnect();}
}
