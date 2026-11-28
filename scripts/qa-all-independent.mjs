import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";

// Run the existing QA manifest without hiding later independent failures.
// Never run against the real database or send live email/AI requests.
const u=new URL(process.env.DATABASE_URL||"");
assert.ok(process.env.CI==="true" && u.hostname==="localhost" && u.port==="5432" && u.pathname==="/naksharix","DISPOSABLE_CI_DATABASE_REQUIRED");
assert.equal(process.env.EMAIL_PROVIDER,"disabled");
assert.equal(process.env.AI_ASTROLOGER_ENABLED,"false");
assert.equal(process.env.AI_REPORT_GENERATOR_ENABLED,"false");
const pkg=JSON.parse(readFileSync("package.json","utf8"));
const commands=pkg.scripts["qa:all"].split(/\s+&&\s+/);
assert.ok(commands.length>0);
const parsed=commands.map(command=>{
  if(/^npm run qa:[a-z0-9-]+$/.test(command)){
    const key=command.slice(8);
    assert.ok(Object.hasOwn(pkg.scripts,key),"UNKNOWN_QA_SCRIPT="+key);
    return {command,file:"npm",args:["run",key]};
  }
  if(/^node (?:--experimental-strip-types )?scripts\/qa-[a-z0-9-]+\.mjs$/.test(command)){
    return {command,file:process.execPath,args:command.split(" ").slice(1)};
  }
  throw new Error("UNRECOGNIZED_QA_MANIFEST_ENTRY="+command);
});
const failed=[];
for(const {command,file,args} of parsed){
  console.log("\nQA_BEGIN="+command);
  const result=spawnSync(file,args,{stdio:"inherit",shell:false,env:process.env});
  if(result.status!==0||result.error){
    failed.push({command,status:result.status,signal:result.signal,error:result.error?.message});
    console.log("QA_FAIL="+command);
  }else console.log("QA_PASS="+command);
}
console.log("QA_MANIFEST_SUMMARY="+JSON.stringify({total:parsed.length,passed:parsed.length-failed.length,failed}));
if(failed.length)process.exitCode=1;
