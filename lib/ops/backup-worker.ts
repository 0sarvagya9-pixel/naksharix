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
unset PGHOST PGUSER PGPASSWORD PGDATABASE PGPORT PGOPTIONS PGHOSTADDR PGSERVICE PGSERVICEFILE PGPASSFILE
export PGHOST=127.0.0.1 PGPORT=55432 PGUSER=naksh_restore PGCONNECT_TIMEOUT=3
stage=CLUSTER_INIT
work=$(mktemp -d /tmp/naksh-restore.XXXXXX)
data="$work/data"
cleanup() {
  status=$?
  trap - EXIT
  pg_ctl -D "$data" stop -m immediate >/dev/null 2>&1 || true
  if [ "$status" -ne 0 ]; then
    printf 'BACKUP_RESTORE_CODE=%s\n' "$stage" >&2
  fi
  rm -rf -- "$work"
  exit "$status"
}
trap cleanup EXIT
initdb -D "$data" -A trust -U naksh_restore >"$work/init.log" 2>&1
stage=CLUSTER_START
# Private Unix socket directory, explicit TCP listener and bounded readiness.
pg_ctl -D "$data" -l "$work/postgres.log" -w -t 12 -o "-h 127.0.0.1 -p 55432 -k $work" start >"$work/start.log" 2>&1
stage=TCP_READY
test "$(psql --no-psqlrc --no-password -d postgres -Atqc 'SELECT 1')" = 1
stage=CREATE_DATABASE
createdb --no-password --template=template0 naksharix_restore
stage=ARCHIVE_TOC
pg_restore --list /tmp/naksh-roundtrip.dump >"$work/archive.list"
# A default public schema is already present in a new database. Only remove it
# when the archive actually contains a CREATE SCHEMA entry for public.
if grep -Eq '^[0-9]+;[[:space:]]+[0-9]+[[:space:]]+[0-9]+[[:space:]]+SCHEMA - public([[:space:]]|$)' "$work/archive.list"; then
  stage=EMPTY_SCHEMA
  psql --no-psqlrc --no-password --dbname=naksharix_restore -v ON_ERROR_STOP=1 -c 'DROP SCHEMA public;' >"$work/empty-schema.log" 2>&1
fi
stage=PG_RESTORE
pg_restore --exit-on-error --no-owner --no-privileges --no-password --dbname=naksharix_restore /tmp/naksh-roundtrip.dump >"$work/restore.log" 2>&1
stage=RESTORE_COUNTS
psql --no-psqlrc --no-password --dbname=naksharix_restore -v ON_ERROR_STOP=1 -At -c "SELECT json_build_object('tables',(SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'),'indexes',(SELECT count(*) FROM pg_indexes WHERE schemaname='public'),'foreignKeys',(SELECT count(*) FROM information_schema.table_constraints WHERE table_schema='public' AND constraint_type='FOREIGN KEY'))" > /tmp/naksh-restore-receipt.json
`;
