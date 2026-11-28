import {backupChecksum,MAX_BACKUP_BYTES,openBackup,sealBackup} from "../../lib/ops/backup-crypto.ts";
import {readRestoreCounts,verifyRecoveryReceipt,receiptIsFresh,sameRecoveryProof} from "../../lib/ops/recovery-receipt.ts";

export const RECOVERY_PREFIX="naksharix-recovery/v1/";
const MAX=MAX_BACKUP_BYTES+64;
const DAY=86400000;
const utcDay=ms=>new Date(ms).toISOString().slice(0,10);
const privateMeta=(m,path)=>Boolean(m&&m.pathname===path&&typeof m.etag==="string"&&m.etag.length>0&&new URL(m.url).protocol==="https:"&&new URL(m.url).hostname.endsWith(".private.blob.vercel-storage.com"));

export function portableCredentials(env,platform,uid){
 if(env.CI==="true"||env.VERCEL_ENV||platform!=="linux"||uid===0||!Number.isInteger(uid)||env.NAKSHARIX_RECOVERY_APPROVAL!=="OWNER_DEDICATED_HOST")throw Error("PORTABLE_DEDICATED_HOST_REQUIRED");
 const key=env.BACKUP_ENCRYPTION_KEY;
 if(!/^[a-f0-9]{64}$/i.test(key||"")||!env.BLOB_READ_WRITE_TOKEN)throw Error("PORTABLE_PROTECTED_INPUTS_REQUIRED");
 let source;try{source=new URL(env.BACKUP_DATABASE_URL||"");}catch{throw Error("PORTABLE_SOURCE_INVALID");}
 if(!["postgres:","postgresql:"].includes(source.protocol)||!source.hostname.replace("-pooler.",".").endsWith(".neon.tech")||source.hostname.replace("-pooler.",".")!==env.BACKUP_EXPECTED_SOURCE_HOST||!source.username||!source.password||source.pathname.length<2)throw Error("PORTABLE_SOURCE_INVALID");
 return {key,sourceUrl:env.BACKUP_DATABASE_URL,expectedHost:env.BACKUP_EXPECTED_SOURCE_HOST};
}

export async function portableRecovery({storage,exportArchive,restoreArchive,key,clock=Date.now}){
 const started=clock(),day=utcDay(started),fingerprint=backupChecksum(Buffer.from(key,"hex")).slice(0,16);
 if(!/^[a-f0-9]{64}$/i.test(key))throw Error("PORTABLE_KEY_INVALID");
 const archivePath=RECOVERY_PREFIX+"archives/"+day+".dump.aesgcm",receiptPath=RECOVERY_PREFIX+"receipts/"+day+".json",lockPath=RECOVERY_PREFIX+"locks/"+day+".json";
 const read=async(path,limit)=>{
  const obj=await storage.read(path,limit);
  if(obj===null)return null;
  if(!privateMeta(obj.meta,path)||!Buffer.isBuffer(obj.bytes)||obj.bytes.length!==obj.meta.size||obj.bytes.length>limit)throw Error("PORTABLE_PRIVATE_READ_INVALID");
  return obj;
 };
 const existing=async()=>{
  const saved=await read(receiptPath,8192);if(!saved)return null;
  const receipt=verifyRecoveryReceipt(JSON.parse(saved.bytes.toString("utf8")),day,fingerprint,clock(),MAX);
  if(!receipt||!receiptIsFresh(receipt,clock()))throw Error("PORTABLE_EXISTING_RECEIPT_INVALID");
  const archive=await read(archivePath,MAX);
  if(!archive||archive.bytes.length!==receipt.bytes||backupChecksum(openBackup(archive.bytes,key))!==receipt.sha256)throw Error("PORTABLE_EXISTING_ARCHIVE_INVALID");
  return receipt;
 };
 const already=await existing();if(already)return {unchanged:true,receipt:already};
 // Same immutable, day-scoped lock used by the production cron. Never remove a
 // lock from another worker, even if stale. Existing cron owns stale recovery.
 const lock=await storage.create(lockPath,Buffer.from(JSON.stringify({startedAt:new Date(started).toISOString(),driver:"portable"})),"application/json");
 if(!privateMeta(lock,lockPath))throw Error("PORTABLE_LOCK_INVALID");
 const guard=async()=>{
  if(clock()-started>=300000||clock()<started)throw Error("PORTABLE_LEASE_DEADLINE");
  const current=await storage.head(lockPath);
  if(!privateMeta(current,lockPath)||current.etag!==lock.etag)throw Error("PORTABLE_LEASE_LOST");
 };
 try{
  await guard();
  const concurrent=await existing();if(concurrent)return {unchanged:true,receipt:concurrent};
  let archive=await read(archivePath,MAX);
  if(!archive){
   const source=await exportArchive(),cipher=sealBackup(source,key),checksum=backupChecksum(source);
   await guard();
   const created=await storage.create(archivePath,cipher,"application/octet-stream");
   if(!privateMeta(created,archivePath))throw Error("PORTABLE_ARCHIVE_NOT_PRIVATE");
   archive=await read(archivePath,MAX);
   if(!archive||backupChecksum(openBackup(archive.bytes,key))!==checksum||!archive.bytes.equals(cipher))throw Error("PORTABLE_ARCHIVE_READBACK");
  }
  const plain=openBackup(archive.bytes,key),checksum=backupChecksum(plain);
  const counts=readRestoreCounts(await restoreArchive(plain));
  if(!counts)throw Error("PORTABLE_RESTORE_INVENTORY");
  await guard();
  // Keep the established seven-day policy; never touch an unrelated path.
  // Conditional deletion prevents deleting a concurrently replaced object.
  for(const group of ["archives/","receipts/"]){
   for(const candidate of await storage.list(RECOVERY_PREFIX+group)){
    const tail=candidate.pathname.slice((RECOVERY_PREFIX+group).length);
    const valid=group==="archives/"?/^\d{4}-\d{2}-\d{2}\.dump\.aesgcm$/.test(tail):/^\d{4}-\d{2}-\d{2}\.json$/.test(tail);
    if(!candidate.pathname.startsWith(RECOVERY_PREFIX+group)||!valid||!privateMeta(candidate,candidate.pathname)||candidate.pathname===archivePath||candidate.pathname===receiptPath)continue;
    if(new Date(candidate.uploadedAt).getTime()>=clock()-7*DAY)continue;
    await guard();
    const current=await storage.head(candidate.pathname);
    if(privateMeta(current,candidate.pathname)&&current.etag===candidate.etag&&new Date(current.uploadedAt).getTime()<clock()-7*DAY)await storage.remove(current.url,current.etag);
   }
  }
  await guard();
  const receipt={version:1,day,completedAt:new Date(clock()).toISOString(),bytes:archive.bytes.length,sha256:checksum,keyFingerprint:fingerprint,encrypted:true,privateStore:true,restored:true,...counts,emailAccepted:false};
  if(!verifyRecoveryReceipt(receipt,day,fingerprint,clock(),MAX))throw Error("PORTABLE_RECEIPT_INVALID");
  const saved=await storage.create(receiptPath,Buffer.from(JSON.stringify(receipt)),"application/json");
  if(!privateMeta(saved,receiptPath))throw Error("PORTABLE_RECEIPT_NOT_PRIVATE");
  const readback=await existing();
  if(!readback||!sameRecoveryProof(receipt,readback))throw Error("PORTABLE_RECEIPT_READBACK");
  return {unchanged:false,receipt:readback};
 }finally{
  // Never remove another worker's lock. A failed cleanup stays visible.
  await storage.remove(lock.url,lock.etag).catch(()=>{});
 }
}
