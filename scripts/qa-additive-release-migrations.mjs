import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
const base="adbcd7e9c14a4bfe15f1f8ad829c1afe9f366204";
assert.equal(process.env.CI,"true");
for(const key of ["DATABASE_URL","DIRECT_URL","PSQL_URL"]){
 const u=new URL(process.env[key]??"");
 assert.equal(u.protocol,"postgresql:");
 assert.equal(u.hostname,"127.0.0.1");
 assert.equal(u.port,"5432");
 assert.equal(u.pathname,"/naksharix_release_fixture");
 assert.equal(u.username,"fixture");
}
const psql=(args)=>execFileSync("psql",[process.env.PSQL_URL,"-X","-v","ON_ERROR_STOP=1",...args],{encoding:"utf8",stdio:["ignore","pipe","pipe"]});
assert.equal(psql(["-Atc","SELECT count(*) FROM information_schema.tables WHERE table_schema='public'"]).trim(),"0","Require fresh synthetic database");
const baseline=execFileSync("git",["show",base+":prisma/schema.prisma"],{encoding:"utf8"});
const hash=createHash("sha256").update(baseline).digest("hex");
writeFileSync("prisma/release-fixture-baseline.prisma",baseline);
execFileSync("npx",["--no-install","prisma","db","push","--skip-generate","--schema=prisma/release-fixture-baseline.prisma"],{stdio:"inherit"});
const names=["MarketingConsent","AiCreditGrant","AiCreditUse","WebPushSubscription","DigitalPackageOrder","DigitalPackageItem","BusinessTenant","BusinessApiKey","BusinessUsageMonth","BusinessUsageCall","ExpertServiceRequest","AiMembership","AiMembershipCycle","ReferenceReminder"];
const files=["20261124-marketing-consent.sql","20261124-ai-credit-ledger.sql","20261124-web-push.sql","20261124-digital-packages.sql","20261124-business-integrations.sql","20261124-expert-services.sql","20261124-ai-membership.sql","20261125-reference-reminders.sql"];
const qnames=names.map(n=>"'"+n+"'").join(",");
const list=()=>psql(["-Atc","SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ("+qnames+") ORDER BY table_name"]).trim().split("\n").filter(Boolean);
assert.equal(list().length,0);
for(let round=1;round<=2;round++){
 for(const name of files){
  const path="deploy/sql/"+name;
  const sql=readFileSync(path,"utf8");
  const statements=sql.split("\n").filter(l=>!l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(statements,/\b(?:DROP|TRUNCATE|DELETE\s+FROM|UPDATE\s+public|INSERT\s+INTO)\b/i);
  psql(["-f",path]);
  console.log("ADDITIVE_MIGRATION_PASS",round,name,createHash("sha256").update(sql).digest("hex"));
 }
 assert.deepEqual(list(),[...names].sort());
}
const schema=readFileSync("prisma/schema.prisma","utf8");
const columns=JSON.parse(psql(["-Atc","SELECT COALESCE(json_agg(json_build_object('table',table_name,'column',column_name,'type',data_type,'nullable',is_nullable)),'[]'::json) FROM information_schema.columns WHERE table_schema='public' AND table_name IN ("+qnames+")"]).trim());
let checked=0;
for(const name of names){
 const match=schema.match(new RegExp("model "+name+" \\{[\\s\\S]*?\\n\\}"));
 assert.ok(match,name);
 for(const line of match[0].split("\n")){
  const m=line.match(/^\s*(\w+)\s+(String|Int|Boolean|DateTime|Json|Bytes)(\[\]|\?)?(?:\s|$)/);
  if(!m)continue;
  const [,field,scalar,modifier]=m;
  const col=columns.find(c=>c.table===name&&c.column===field);
  assert.ok(col,name+"."+field+" missing");
  const expected=modifier==="[]"?"ARRAY":{String:"text",Int:"integer",Boolean:"boolean",DateTime:"timestamp without time zone",Json:"jsonb",Bytes:"bytea"}[scalar];
  assert.equal(col.type,expected,name+"."+field);
  assert.equal(col.nullable,modifier==="?"?"YES":"NO",name+"."+field+" nullability");
  checked++;
 }
}
const purposes=psql(["-Atc","SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid WHERE t.typname='PaymentPurpose' ORDER BY e.enumlabel"]).trim().split("\n");
for(const purpose of ["AI_CREDITS","DIGITAL_PACKAGE","EXPERT_SERVICE","AI_MEMBERSHIP"])assert.ok(purposes.includes(purpose),purpose);
console.log(JSON.stringify({result:"ISOLATED_ADDITIVE_MIGRATION_REHEARSAL_PASS",migrations:files.length,passes:2,newTables:names.length,columnsChecked:checked,baselineCommit:base,baselineSchemaSha256:hash,scope:"synthetic localhost only"}));
