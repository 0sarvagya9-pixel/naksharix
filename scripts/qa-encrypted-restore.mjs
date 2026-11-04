import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { sealBackup, openBackup } from '../lib/ops/backup-crypto.ts';
import { RESTORE_WORKER } from '../lib/ops/backup-worker.ts';
const url=new URL(process.env.DATABASE_URL||'postgresql://invalid/invalid');
if(process.env.CI!=='true'||!['localhost','127.0.0.1'].includes(url.hostname)||url.pathname!=='/naksharix')throw new Error('DISPOSABLE_LOCALHOST_ONLY');
const run=(cmd,args,env={})=>{const r=spawnSync(cmd,args,{encoding:'utf8',timeout:90000,env:{...process.env,...env}});assert.equal(r.status,0,cmd+' failed in isolated recovery rehearsal');return r;};
try {
  rmSync('/tmp/naksh-restore',{recursive:true,force:true});
  run('pg_dump',['--host=127.0.0.1','--username=postgres','--dbname=naksharix','--format=custom','--no-owner','--no-privileges','--schema=public','--file=/tmp/naksh-synthetic.dump'],{PGOPTIONS:'-c default_transaction_read_only=on'});
  const source=readFileSync('/tmp/naksh-synthetic.dump'), key=randomBytes(32).toString('hex');
  const encrypted=sealBackup(source,key);writeFileSync('/tmp/naksh-synthetic.dump.aesgcm',encrypted,{mode:0o600});
  const recovered=openBackup(readFileSync('/tmp/naksh-synthetic.dump.aesgcm'),key);assert.deepEqual(recovered,source);
  writeFileSync('/tmp/naksh-roundtrip.dump',recovered,{mode:0o600});
  writeFileSync('/tmp/naksh-rehearsal.sh',RESTORE_WORKER,{mode:0o700});run('bash',['/tmp/naksh-rehearsal.sh']);
  const receipt=JSON.parse(readFileSync('/tmp/naksh-restore-receipt.json','utf8'));assert.equal(receipt.tables,43);assert.ok(receipt.indexes>=100);assert.ok(receipt.foreignKeys>=40);
  console.log(JSON.stringify({result:'ENCRYPTED_RESTORE_PASS',...receipt,scope:'isolated_synthetic_database_only'}));
} finally {for(const file of ['/tmp/naksh-synthetic.dump','/tmp/naksh-synthetic.dump.aesgcm','/tmp/naksh-roundtrip.dump','/tmp/naksh-rehearsal.sh'])rmSync(file,{force:true});}
