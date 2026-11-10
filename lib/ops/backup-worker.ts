/** Fixed reviewed worker: no user-supplied commands, paths, hostnames or SQL. */
export const EXPORT_WORKER = String.raw`
import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
process.umask(0o077);
let diagnostic = 'UNKNOWN';
try {
  diagnostic = 'CONNECTION_URL';
  const url = new URL(process.env.BACKUP_DATABASE_URL || '');
  if (!['postgres:','postgresql:'].includes(url.protocol)) throw new Error('protocol');
  url.hostname = url.hostname.replace('-pooler.', '.');
  diagnostic = 'HOST_MISMATCH';
  if (!process.env.BACKUP_EXPECTED_SOURCE_HOST || url.hostname !== process.env.BACKUP_EXPECTED_SOURCE_HOST ||
      !url.hostname.endsWith('.neon.tech')) throw new Error('host');
  // Validate a server-authenticated, read-only connection before any export.
  // This also wakes an autosuspended Neon compute without changing source rows.
  const pgEnv = { ...process.env,
    PGHOST:url.hostname, PGPORT:url.port||'5432', PGUSER:decodeURIComponent(url.username),
    PGPASSWORD:decodeURIComponent(url.password), PGDATABASE:decodeURIComponent(url.pathname.slice(1)),
    PGSSLMODE:'require', PGGSSENCMODE:'disable', PGCONNECT_TIMEOUT:'12',
    PGOPTIONS:'-c default_transaction_read_only=on -c statement_timeout=100000 -c lock_timeout=15000'
  };
  const classify = (result) => {
    const note=String(result.stderr || '').toLowerCase();
    if(result.error?.code === 'ENOENT') return 'CLIENT_MISSING';
    if(/password authentication failed|no password supplied|authentication failed|role .* does not exist/.test(note))return 'AUTH';
    if(/permission denied|must be member of|insufficient privilege/.test(note))return 'PERMISSION';
    if(/could not translate host name|name or service not known|temporary failure in name resolution/.test(note))return 'DNS';
    if(/ssl|tls|certificate|channel binding/.test(note))return 'TLS';
    if(/lock timeout|canceling statement due to lock timeout/.test(note))return 'LOCK_TIMEOUT';
    if(/statement timeout|canceling statement due to statement timeout/.test(note))return 'QUERY_TIMEOUT';
    if(result.error?.code === 'ETIMEDOUT') return 'CLIENT_TIMEOUT';
    if(/timeout|timed out|refused|unreachable|server closed|could not connect|connection reset/.test(note))return 'NETWORK';
    if(/server version|aborting because of server version mismatch/.test(note))return 'VERSION';
    if(/unrecognized configuration parameter|invalid value for parameter/.test(note))return 'PG_OPTIONS';
    return 'PG_DUMP';
  };
  let preflight=false;
  diagnostic='CONNECT_PROBE';
  for (let attempt=0; attempt<2; attempt++) {
    const probe=spawnSync('psql',['--no-psqlrc','--tuples-only','--no-align','--quiet',
      '--command',"SELECT current_setting('transaction_read_only')"],{
      timeout:18000,maxBuffer:65536,encoding:'utf8',env:pgEnv
    });
    if(probe.status===0) {
      if(String(probe.stdout || '').trim()!=='on'){diagnostic='READONLY_GUARD';throw new Error('source not read only');}
      preflight=true;
      break;
    }
    diagnostic=classify(probe);
    if(attempt===1 || !['NETWORK','DNS','CLIENT_TIMEOUT'].includes(diagnostic))break;
    await new Promise(resolve=>setTimeout(resolve,1500));
  }
  if(!preflight)throw new Error('source connection unavailable');
  diagnostic='PG_DUMP';
  const result=spawnSync('pg_dump',['--format=custom','--no-owner','--no-privileges',
    '--schema=public','--file=/tmp/naksh-source.dump'],{
    timeout:110000,maxBuffer:1024*1024,encoding:'utf8',env:pgEnv
  });
  if(result.status !== 0) {
    diagnostic=classify(result);
    throw new Error('export unavailable');
  }
  diagnostic = 'ARCHIVE_FILE';
  const size=statSync('/tmp/naksh-source.dump').size;
  diagnostic = 'ARCHIVE_SIZE';
  if(size<100||size>64*1024*1024)throw new Error('size');
  console.log(JSON.stringify({ok:true,archiveBytes:size}));
} catch { console.error('BACKUP_EXPORT_CODE='+diagnostic);process.exit(1); }
`;
export const RESTORE_WORKER = String.raw`
set -euo pipefail
umask 077
unset PGHOST PGUSER PGPASSWORD PGDATABASE PGPORT PGOPTIONS
export PGHOST=127.0.0.1 PGPORT=55432 PGUSER=naksh_restore
mkdir -p /tmp/naksh-restore
initdb -D /tmp/naksh-restore -A trust -U naksh_restore >/tmp/naksh-init.log 2>&1
pg_ctl -D /tmp/naksh-restore -l /tmp/naksh-pg.log -o '-h 127.0.0.1 -p 55432' start >/tmp/naksh-start.log 2>&1
trap 'pg_ctl -D /tmp/naksh-restore stop -m immediate >/dev/null 2>&1 || true' EXIT
createdb naksharix_restore
# This newly created loopback-only database has no customer data.
psql --dbname=naksharix_restore -v ON_ERROR_STOP=1 -c 'DROP SCHEMA public;' >/tmp/naksh-empty-schema.log 2>&1
pg_restore --exit-on-error --no-owner --no-privileges --dbname=naksharix_restore /tmp/naksh-roundtrip.dump >/tmp/naksh-restore.log 2>&1
psql --dbname=naksharix_restore -At -c "SELECT json_build_object('tables',(SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'),'indexes',(SELECT count(*) FROM pg_indexes WHERE schemaname='public'),'foreignKeys',(SELECT count(*) FROM information_schema.table_constraints WHERE table_schema='public' AND constraint_type='FOREIGN KEY'))" > /tmp/naksh-restore-receipt.json
`;
