import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { sealBackup, openBackup } from '../lib/ops/backup-crypto.ts';
import { RESTORE_WORKER } from '../lib/ops/backup-worker.ts';
import { readRestoreCounts } from '../lib/ops/recovery-receipt.ts';
const url=new URL(process.env.DATABASE_URL||'postgresql://invalid/invalid');
if(process.env.CI!=='true'||!['postgresql:','postgres:'].includes(url.protocol)||!['localhost','127.0.0.1'].includes(url.hostname)||url.port!=='5432'||url.pathname!=='/naksharix'||url.username!=='postgres')throw new Error('DISPOSABLE_LOCALHOST_ONLY');
const cleanEnv={...process.env};
for(const key of ['PGHOST','PGHOSTADDR','PGPORT','PGUSER','PGDATABASE','PGOPTIONS','PGSERVICE','PGSERVICEFILE','PGPASSFILE'])delete cleanEnv[key];
const run=(cmd,args,env={})=>{
 const r=spawnSync(cmd,args,{encoding:'utf8',timeout:90000,env:{...cleanEnv,...env}});
 if(r.status!==0){
  const code=(r.stderr||'').match(/BACKUP_RESTORE_CODE=([A-Z_]+)/)?.[1];
  console.error('ISOLATED_RECOVERY_FAILURE',JSON.stringify({command:cmd,status:r.status,signal:r.signal,code:code||r.error?.code||'UNKNOWN'}));
 }
 assert.equal(r.status,0,cmd+' failed in isolated recovery rehearsal');return r;
};
const psql=['--no-psqlrc','--no-password','--host=127.0.0.1','--port=5432','--username=postgres','--dbname=naksharix','-v','ON_ERROR_STOP=1','-Atqc'];
const counts="SELECT json_build_object('tables',(SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'),'indexes',(SELECT count(*) FROM pg_indexes WHERE schemaname='public'),'foreignKeys',(SELECT count(*) FROM information_schema.table_constraints WHERE table_schema='public' AND constraint_type='FOREIGN KEY'))";
const fixture='naksharix_restore_qa_fixture';
let inserted=false;
try {
  rmSync('/tmp/naksh-restore-receipt.json',{force:true});
  run('psql',[...psql,"CREATE TABLE public."+fixture+" (id integer PRIMARY KEY, value text NOT NULL); INSERT INTO public."+fixture+" VALUES (1,'synthetic-recovery-marker-v1'),(2,'synthetic-recovery-marker-v2');"]);
  inserted=true;
  const expected=JSON.parse(run('psql',[...psql,counts],{PGOPTIONS:'-c default_transaction_read_only=on'}).stdout);
  assert.ok(readRestoreCounts(expected),'Source must satisfy minimum protected schema inventory');
  run('pg_dump',['--host=127.0.0.1','--port=5432','--username=postgres','--dbname=naksharix','--format=custom','--no-owner','--no-privileges','--schema=public','--file=/tmp/naksh-synthetic.dump'],{PGOPTIONS:'-c default_transaction_read_only=on'});
  const source=readFileSync('/tmp/naksh-synthetic.dump'),key=randomBytes(32).toString('hex');
  const encrypted=sealBackup(source,key);writeFileSync('/tmp/naksh-synthetic.dump.aesgcm',encrypted,{mode:0o600});
  const recovered=openBackup(readFileSync('/tmp/naksh-synthetic.dump.aesgcm'),key);assert.deepEqual(recovered,source);
  writeFileSync('/tmp/naksh-roundtrip.dump',recovered,{mode:0o600});
  // Check the restored rows BEFORE the worker's exit trap stops the isolated cluster.
  const markerCheck="\nstage=FIXTURE_DATA\npsql --no-psqlrc --no-password --dbname=naksharix_restore -v ON_ERROR_STOP=1 -Atqc \"SELECT string_agg(value, ',' ORDER BY id) FROM public."+fixture+"\" > /tmp/naksh-restore-marker.txt\n";
  writeFileSync('/tmp/naksh-rehearsal.sh',RESTORE_WORKER+markerCheck,{mode:0o700});
  run('bash',['/tmp/naksh-rehearsal.sh']);
  const receipt=JSON.parse(readFileSync('/tmp/naksh-restore-receipt.json','utf8'));
  assert.deepEqual(readRestoreCounts(receipt),readRestoreCounts(expected),'Restore must reproduce exact current schema counts, not a historical fixed table count');
  assert.equal(readFileSync('/tmp/naksh-restore-marker.txt','utf8').trim(),'synthetic-recovery-marker-v1,synthetic-recovery-marker-v2');
  console.log(JSON.stringify({result:'ENCRYPTED_RESTORE_PASS',...receipt,dataFixtureVerified:true,scope:'isolated_synthetic_database_only'}));
} finally {
  if(inserted)run('psql',[...psql,'DROP TABLE public.'+fixture]);
  for(const file of ['/tmp/naksh-synthetic.dump','/tmp/naksh-synthetic.dump.aesgcm','/tmp/naksh-roundtrip.dump','/tmp/naksh-rehearsal.sh','/tmp/naksh-restore-receipt.json','/tmp/naksh-restore-marker.txt'])rmSync(file,{force:true});
}
