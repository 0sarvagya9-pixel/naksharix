import {portableCredentials,portableRecovery} from "./portable-recovery-core.mjs";
import {localRecoveryWorkers} from "./portable-recovery-workers.mjs";
// Explicit manual action, no cron or CI secret access. Real customer data
// stays inside the dedicated authorized runner and existing private Blob store.
try{
 if(process.argv.length!==3||process.argv[2]!=="--execute-private-recovery")throw Error("PORTABLE_EXPLICIT_EXECUTION_REQUIRED");
 const config=portableCredentials(process.env,process.platform,process.getuid?.());
 const {get,put,head,del,list}=await import("@vercel/blob");
 const storage={
  async read(path,limit){
   const x=await get(path,{access:"private",useCache:false});
   if(x===null)return null;
   if(x.statusCode!==200||x.blob.size>limit)throw Error("PORTABLE_STORAGE_READ");
   const reader=x.stream.getReader();const chunks=[];let size=0;
   try{for(;;){const item=await reader.read();if(item.done)break;size+=item.value.byteLength;if(size>limit)throw Error("PORTABLE_STORAGE_SIZE");chunks.push(item.value);}}
   finally{reader.releaseLock();}
   return {meta:x.blob,bytes:Buffer.concat(chunks)};
  },
  head,
  create:(path,bytes,contentType)=>put(path,bytes,{access:"private",addRandomSuffix:false,allowOverwrite:false,contentType}),
  remove:(url,etag)=>del(url,{ifMatch:etag}),
  async list(prefix){const all=[];let cursor;for(let page=0;page<10;page++){const x=await list({prefix,limit:1000,cursor});all.push(...x.blobs);if(!x.hasMore)return all;if(!x.cursor)throw Error("PORTABLE_RETENTION_CURSOR");cursor=x.cursor;}throw Error("PORTABLE_RETENTION_LIMIT");}
 };
 const workers=localRecoveryWorkers(config);
 try{const proof=await portableRecovery({storage,exportArchive:workers.exportArchive,restoreArchive:workers.restoreArchive,key:config.key});
  console.log("PORTABLE_RECOVERY_VERIFIED="+JSON.stringify({unchanged:proof.unchanged,day:proof.receipt.day,tables:proof.receipt.tables,indexes:proof.receipt.indexes,foreignKeys:proof.receipt.foreignKeys,encrypted:proof.receipt.encrypted,restoreVerified:proof.receipt.restored,emailAccepted:proof.receipt.emailAccepted}));
 }finally{workers.close();}
}catch(error){const code=error instanceof Error&&/^PORTABLE_[A-Z0-9_]+$/.test(error.message)?error.message:"PORTABLE_RECOVERY_FAILED";console.error(code);process.exitCode=1;}
