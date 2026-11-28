import assert from "node:assert/strict";
import {portableCredentials,portableRecovery,RECOVERY_PREFIX} from "./ops/portable-recovery-core.mjs";
import {portableExportScript,portableRestoreScript} from "./ops/portable-recovery-workers.mjs";
import {sealBackup} from "../lib/ops/backup-crypto.ts";
const now=Date.parse("2026-11-25T06:00:00Z"),key="ab".repeat(32),source=Buffer.concat([Buffer.from("PGDMP"),Buffer.alloc(300,42)]);
const counts={tables:58,indexes:150,foreignKeys:65};
const prefix=RECOVERY_PREFIX,archive=prefix+"archives/2026-11-25.dump.aesgcm",receipt=prefix+"receipts/2026-11-25.json",lock=prefix+"locks/2026-11-25.json";
let checks=0;
const check=(x,m)=>{assert.ok(x,m);checks++;};
function fixture(){
 const objects=new Map();let writes=0,restores=0,exports=0;
 function meta(p,bytes,at=now){return {pathname:p,etag:"fixture-"+(++writes),url:"https://fixture.private.blob.vercel-storage.com/"+p,size:bytes.length,uploadedAt:new Date(at)};}
 const storage={
  async read(p,limit){const x=objects.get(p);if(!x)return null;assert.ok(x.bytes.length<=limit);return {meta:{...x.meta},bytes:Buffer.from(x.bytes)};},
  async head(p){return objects.get(p)?.meta??null;},
  async create(p,b){if(objects.has(p))throw Error("immutable conflict");const m=meta(p,b);objects.set(p,{meta:m,bytes:Buffer.from(b)});return m;},
  async remove(url,etag){const p=new URL(url).pathname.slice(1);if(objects.get(p)?.meta.etag===etag)objects.delete(p);else throw Error("conditional conflict");},
  async list(p){return [...objects.values()].map(x=>x.meta).filter(m=>m.pathname.startsWith(p));}
 };
 const input={storage,key,clock:()=>now,exportArchive:async()=>{exports++;return source},restoreArchive:async bytes=>{restores++;assert.deepEqual(bytes,source);return counts}};
 return {objects,input,storage,seed(p,b,at){objects.set(p,{meta:meta(p,b,at),bytes:b});},counts:()=>({exports,restores})};
}
const env={BACKUP_DATABASE_URL:"postgresql://fixture:fixture@ep-fixture.us-east-1.aws.neon.tech/neondb",BACKUP_EXPECTED_SOURCE_HOST:"ep-fixture.us-east-1.aws.neon.tech",BACKUP_ENCRYPTION_KEY:key,BLOB_READ_WRITE_TOKEN:"synthetic",NAKSHARIX_RECOVERY_APPROVAL:"OWNER_DEDICATED_HOST"};
check(portableCredentials(env,"linux",1000).expectedHost===env.BACKUP_EXPECTED_SOURCE_HOST,"valid private host");
for(const [e,p,u] of [[{...env,CI:"true"},"linux",1000],[env,"linux",0],[env,"win32",1000],[{...env,VERCEL_ENV:"production"},"linux",1000],[{...env,BACKUP_EXPECTED_SOURCE_HOST:"wrong.neon.tech"},"linux",1000],[{...env,NAKSHARIX_RECOVERY_APPROVAL:""},"linux",1000]]){assert.throws(()=>portableCredentials(e,p,u));checks++;}
const root="/tmp/naksh-portable-Fixture1",script=portableRestoreScript(root);
check(script.includes('export PGHOST="$work"')&&script.includes("-h ''")&&script.includes("unix_socket_permissions=0700")&&!script.includes("PGHOST=127.0.0.1"),"Unix socket only");
check(portableExportScript(root).includes(root+"/source.dump"),"unique temporary source");
assert.throws(()=>portableRestoreScript("/tmp/unsafe path"));checks++;
const a=fixture();
a.seed(prefix+"archives/2026-11-10.dump.aesgcm",Buffer.from("old"),now-15*86400000);
a.seed("unrelated",Buffer.from("keep"),now-15*86400000);
const done=await portableRecovery(a.input);
check(done.unchanged===false&&done.receipt.restored&&done.receipt.emailAccepted===false,"actual receipt after restore adapter");
check(a.objects.has(archive)&&a.objects.has(receipt)&&!a.objects.has(lock),"durable archive/receipt and lease cleanup");
check(!a.objects.has(prefix+"archives/2026-11-10.dump.aesgcm")&&a.objects.has("unrelated"),"bounded retention");
check((await portableRecovery(a.input)).unchanged===true,"same-day verified idempotency");
check(a.counts().exports===1&&a.counts().restores===1,"no repeat export or restore");
a.objects.get(archive).bytes[40]^=1;
await assert.rejects(portableRecovery(a.input));checks++;
const b=fixture();b.seed(archive,sealBackup(source,key),now);
check((await portableRecovery(b.input)).receipt.restored&&b.counts().exports===0&&b.counts().restores===1,"restore prior immutable archive");
const c=fixture();await assert.rejects(portableRecovery({...c.input,restoreArchive:async()=>({tables:1,indexes:2,foreignKeys:3})}),/INVENTORY/);checks++;
check(!c.objects.has(receipt)&&!c.objects.has(lock),"no proof on invalid restore");
const d=fixture();d.seed(lock,Buffer.from("another worker"),now);
await assert.rejects(portableRecovery(d.input),/conflict/);checks++;
check(d.objects.has(lock)&&d.counts().exports===0,"do not delete another lease");
const e=fixture();const original=e.storage.create;e.storage.create=async(p,b)=>{const m=await original(p,b);if(p===archive)e.objects.get(p).bytes[40]^=1;return m};
await assert.rejects(portableRecovery(e.input));checks++;
check(!e.objects.has(receipt),"no receipt on failed private readback");
const g=fixture();const originalHead=g.storage.head;g.storage.head=async p=>p===lock?{...(await originalHead(p)),etag:"different"}:originalHead(p);
await assert.rejects(portableRecovery(g.input),/LEASE_LOST/);checks++;
check(!g.objects.has(archive),"no archive write after lease loss");
console.log("PORTABLE_RECOVERY_CONTRACT_PASS="+JSON.stringify({checks,productionConnections:0,syntheticStorage:true,workerContracts:true}));
