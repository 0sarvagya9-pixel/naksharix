import {EXPORT_WORKER,RESTORE_WORKER} from "../../lib/ops/backup-worker.ts";
import {mkdtempSync,writeFileSync,readFileSync,rmSync,mkdirSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {join} from "node:path";

function privateRoot(root){
 if(!/^\/tmp\/naksh-portable-[a-zA-Z0-9]+$/.test(root))throw Error("PORTABLE_TEMP_PATH");
 return root;
}
function replace(source,a,b){if(!source.includes(a))throw Error("PORTABLE_WORKER_CONTRACT");return source.replaceAll(a,b);}
export function portableRestoreScript(root){
 privateRoot(root);
 let s=replace(RESTORE_WORKER,"/tmp/naksh-roundtrip.dump",root+"/roundtrip.dump");
 s=replace(s,"/tmp/naksh-restore-receipt.json",root+"/restore-receipt.json");
 s=replace(s,"export PGHOST=127.0.0.1 PGPORT=55432 PGUSER=naksh_restore PGCONNECT_TIMEOUT=3","export PGPORT=55432 PGUSER=naksh_restore PGCONNECT_TIMEOUT=3");
 s=replace(s,"work=$(mktemp -d /tmp/naksh-restore.XXXXXX)","work="+root+"/restore\nmkdir -m 700 \"$work\"\nexport PGHOST=\"$work\"");
 s=replace(s,"-h 127.0.0.1 -p 55432 -k $work","-h '' -p 55432 -k $work -c unix_socket_permissions=0700");
 return s;
}
export function portableExportScript(root){
 privateRoot(root);return replace(EXPORT_WORKER,"/tmp/naksh-source.dump",root+"/source.dump");
}
const safeEnv=()=>({PATH:process.env.PATH||"/usr/bin:/bin",HOME:process.env.HOME||"/tmp",LANG:"C",LC_ALL:"C"});
function run(cmd,args,env,timeout){
 const x=spawnSync(cmd,args,{env,timeout,encoding:"utf8",maxBuffer:1048576});
 if(x.status!==0){
  const code=String(x.stderr||"").match(/BACKUP_(?:EXPORT|RESTORE)_CODE=([A-Z_]+)/)?.[1];
  throw Error("PORTABLE_WORKER_FAILED_"+(code||"COMMAND"));
 }
}
export function localRecoveryWorkers(credentials){
 const root=mkdtempSync("/tmp/naksh-portable-");privateRoot(root);
 return {
  exportArchive(){
   writeFileSync(join(root,"export.mjs"),portableExportScript(root),{mode:0o600});
   run(process.execPath,[join(root,"export.mjs")],{...safeEnv(),BACKUP_DATABASE_URL:credentials.sourceUrl,BACKUP_EXPECTED_SOURCE_HOST:credentials.expectedHost},150000);
   return readFileSync(join(root,"source.dump"));
  },
  restoreArchive(plain){
   writeFileSync(join(root,"roundtrip.dump"),plain,{mode:0o600});
   writeFileSync(join(root,"restore.sh"),portableRestoreScript(root),{mode:0o700});
   try{run("bash",[join(root,"restore.sh")],safeEnv(),65000);}
   finally{
    // Also terminate the known private cluster after an interrupted shell.
    spawnSync("pg_ctl",["-D",join(root,"restore","data"),"stop","-m","immediate"],{env:safeEnv(),timeout:5000,stdio:"ignore"});
   }
   return JSON.parse(readFileSync(join(root,"restore-receipt.json"),"utf8"));
  },
  close(){rmSync(root,{recursive:true,force:true});}
 };
}
