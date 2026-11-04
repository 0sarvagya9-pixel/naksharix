import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { Sandbox } from "@vercel/sandbox";
import { get, put, list, del, head } from "@vercel/blob";
import { backupChecksum, MAX_BACKUP_BYTES, openBackup, sealBackup } from "@/lib/ops/backup-crypto";
import { EXPORT_WORKER, RESTORE_WORKER } from "@/lib/ops/backup-worker";
import { sendEmail } from "@/lib/email/email-service";

const PREFIX="naksharix-recovery/v1/";
const EXPECTED_PROJECT="prj_hB0nIWZqcOeBstlRVHuNKUs27RP5";
type RecoveryReceipt={version:1;day:string;completedAt:string;bytes:number;sha256:string;keyFingerprint:string;
  encrypted:true;privateStore:true;restored:true;tables:number;indexes:number;foreignKeys:number;emailAccepted:boolean};
export function dailyRecoveryConfigured() {
  return process.env.BACKUP_ENABLED === "true" && Boolean(process.env.BLOB_READ_WRITE_TOKEN) &&
    /^[a-f0-9]{64}$/i.test(process.env.BACKUP_ENCRYPTION_KEY||'') && Boolean(process.env.CRON_SECRET) &&
    Boolean(process.env.DIRECT_URL || process.env.DATABASE_URL) && Boolean(process.env.BACKUP_EXPECTED_SOURCE_HOST);
}
export function authorizedRecoveryRequest(request: Request) {
  const secret=process.env.CRON_SECRET;
  if (!secret || secret.length<32) return false;
  const supplied=request.headers.get('authorization')||'';
  return timingSafeEqual(createHash('sha256').update(supplied).digest(),createHash('sha256').update('Bearer '+secret).digest());
}
async function readPrivate(path: string, maxBytes: number) {
  const result=await get(path,{access:'private',useCache:false});
  if(!result||result.statusCode!==200)return null;
  if(result.blob.size>maxBytes)throw new Error('BACKUP_SIZE_LIMIT');
  const reader=result.stream.getReader(); const chunks:Uint8Array[]=[];let total=0;
  try { for(;;){const next=await reader.read();if(next.done)break;total+=next.value.byteLength;
    if(total>maxBytes)throw new Error('BACKUP_SIZE_LIMIT');chunks.push(next.value);}}
  finally {reader.releaseLock();}
  return Buffer.concat(chunks);
}
async function readReceipt(day:string):Promise<RecoveryReceipt|null> {
  try {
    const data=await readPrivate(PREFIX+'receipts/'+day+'.json',8192);if(!data)return null;
    const receipt=JSON.parse(data.toString()) as RecoveryReceipt;
    return receipt.version===1 && receipt.day===day && receipt.restored===true && receipt.encrypted===true &&
      receipt.privateStore===true && receipt.tables>=43 && /^[a-f0-9]{64}$/.test(receipt.sha256) ? receipt:null;
  } catch { return null; }
}
export async function recoveryHealth() {
  if(!dailyRecoveryConfigured())return {configured:false,operational:false,reason:'protected_setup_missing'};
  const today=new Date();
  for(const delta of [0,1]) {
    const day=new Date(today.getTime()-delta*86400000).toISOString().slice(0,10);
    const receipt=await readReceipt(day);
    if(receipt && Date.now()-Date.parse(receipt.completedAt)<36*3600000)
      return {configured:true,operational:true,lastSuccessfulAt:receipt.completedAt,encrypted:true,restoreVerified:true,
        retentionDays:7,emailAccepted:receipt.emailAccepted};
  }
  return {configured:true,operational:false,reason:'fresh_verified_receipt_missing'};
}
async function notify(day:string,success:boolean,detail:string) {
  const to=process.env.EMAIL_QA_RECIPIENT;
  if(!to)return false;
  try {
    const result=await sendEmail({to,subject:`NAKSHARIX daily recovery ${success?'PASS':'FAILED'} — ${day}`,
      text:`NAKSHARIX operational notice\nDate (UTC): ${day}\n${detail}\nThis notice was sent by the production NAKSHARIX Resend adapter. It contains no customer or birth data.`,
      idempotencyKey:`naksharix-recovery-${day}-${success?'pass':'failed'}`});
    return result.sent;
  }catch{return false;}
}
export async function runDailyRecovery() {
  if(process.env.VERCEL_ENV!=='production' || (process.env.VERCEL_PROJECT_ID && process.env.VERCEL_PROJECT_ID!==EXPECTED_PROJECT))
    throw new Error('BACKUP_PRODUCTION_SCOPE_REQUIRED');
  if(!dailyRecoveryConfigured())throw new Error('BACKUP_PROTECTED_SETUP_MISSING');
  const day=new Date().toISOString().slice(0,10),existing=await readReceipt(day);
  if(existing)return {unchanged:true,receipt:existing};
  const lockPath=PREFIX+'locks/'+day+'.json';
  const priorLock=await head(lockPath).catch(()=>null);
  if(priorLock) {
    if(Date.now()-priorLock.uploadedAt.getTime()<6*60000)throw new Error('BACKUP_ALREADY_RUNNING');
    await del(priorLock.url,{ifMatch:priorLock.etag});
  }
  const lock=await put(lockPath,JSON.stringify({startedAt:new Date().toISOString()}),{
    access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});
  let sandbox:Sandbox|null=null;let stage='sandbox_start';
  try {
    sandbox=await Sandbox.create({runtime:'node22',timeout:240000,resources:{vcpus:1},persistent:false,region:'bom1'});
    stage='postgres_tools';
    const install=await sandbox.runCommand({cmd:'bash',args:['-lc','dnf install -y postgresql17-server postgresql17 >/tmp/package-install.log 2>&1'],sudo:true,timeoutMs:90000});
    if(install.exitCode!==0)throw new Error('INSTALL_FAILED');
    await sandbox.writeFiles([{path:'/tmp/naksh-export.mjs',content:EXPORT_WORKER,mode:0o600},
      {path:'/tmp/naksh-restore.sh',content:RESTORE_WORKER,mode:0o700}]);
    stage='readonly_export';
    const dump=await sandbox.runCommand({cmd:'node',args:['/tmp/naksh-export.mjs'],timeoutMs:100000,env:{
      BACKUP_DATABASE_URL:process.env.DIRECT_URL||process.env.DATABASE_URL!,
      BACKUP_EXPECTED_SOURCE_HOST:process.env.BACKUP_EXPECTED_SOURCE_HOST!
    }});
    if(dump.exitCode!==0)throw new Error('EXPORT_FAILED');
    const plain=await sandbox.readFileToBuffer({path:'/tmp/naksh-source.dump'});
    if(!plain||plain.length>MAX_BACKUP_BYTES)throw new Error('ARCHIVE_INVALID');
    const key=process.env.BACKUP_ENCRYPTION_KEY!;
    const checksum=backupChecksum(plain), encrypted=sealBackup(plain,key);
    stage='private_ciphertext_upload';
    const archivePath=PREFIX+'archives/'+day+'.dump.aesgcm';
    // An interrupted earlier run may leave immutable ciphertext. Never overwrite it.
    const prior=await readPrivate(archivePath,MAX_BACKUP_BYTES+64).catch(()=>null);
    let stored:Buffer;
    if(prior)stored=prior;
    else {
      const blob=await put(archivePath,encrypted,{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/octet-stream'});
      if(!new URL(blob.url).hostname.endsWith('.private.blob.vercel-storage.com'))throw new Error('PRIVATE_STORE_REQUIRED');
      const roundtrip=await readPrivate(blob.url,MAX_BACKUP_BYTES+64);if(!roundtrip)throw new Error('ROUNDTRIP_MISSING');stored=roundtrip;
    }
    stage='ciphertext_roundtrip';
    const restoredDump=openBackup(stored,key);
    if(!prior&&backupChecksum(restoredDump)!==checksum)throw new Error('CHECKSUM_MISMATCH');
    await sandbox.writeFiles([{path:'/tmp/naksh-roundtrip.dump',content:restoredDump,mode:0o600}]);
    stage='isolated_restore';
    const restore=await sandbox.runCommand({cmd:'bash',args:['/tmp/naksh-restore.sh'],timeoutMs:90000});
    if(restore.exitCode!==0)throw new Error('RESTORE_FAILED');
    const report=await sandbox.readFileToBuffer({path:'/tmp/naksh-restore-receipt.json'});
    const counts=JSON.parse(report?.toString()||'{}') as {tables:number;indexes:number;foreignKeys:number};
    if(!Number.isInteger(counts.tables)||counts.tables<43||counts.indexes<100||counts.foreignKeys<40)throw new Error('RESTORE_SCHEMA_INCOMPLETE');
    const receipt:RecoveryReceipt={version:1,day,completedAt:new Date().toISOString(),bytes:stored.length,
      sha256:backupChecksum(restoredDump),keyFingerprint:backupChecksum(Buffer.from(key,'hex')).slice(0,16),
      encrypted:true,privateStore:true,restored:true,...counts,emailAccepted:false};
    stage='retention';
    const cutoff=Date.now()-7*86400000;
    for(const group of ['archives/','receipts/']) {
      const old=await list({prefix:PREFIX+group,limit:1000});
      const expired=old.blobs.filter(b=>b.uploadedAt.getTime()<cutoff && b.pathname.startsWith(PREFIX+group));
      if(expired.length)await del(expired.map(b=>b.url));
    }
    // Analytics retention is owned by the analytics collector; recovery never writes production rows.
    stage='receipt';
    receipt.emailAccepted=await notify(day,true,`Encrypted private backup uploaded, downloaded, decrypted and restored in an isolated database. Restored tables: ${counts.tables}. Retention: 7 days. No production data was modified.`);
    await put(PREFIX+'receipts/'+day+'.json',JSON.stringify(receipt),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});
    return {unchanged:false,receipt};
  }catch {
    await notify(day,false,`The daily recovery task failed at stage: ${stage}. Production database was not changed. Check the private operations dashboard; no successful restore is claimed.`);
    throw new Error('BACKUP_FAILED_'+stage.toUpperCase());
  }finally {
    await sandbox?.stop().catch(()=>{});
    await del(lock.url).catch(()=>{});
  }
}
