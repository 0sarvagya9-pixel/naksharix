#!/usr/bin/env bash
set -euo pipefail

EVIDENCE_DIR="${1:-database-rehearsal-evidence}"
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${PSQL_URL:?PSQL_URL is required}"
: "${POSTGRES_ADMIN_URL:?POSTGRES_ADMIN_URL is required}"
: "${RESTORE_URL:?RESTORE_URL is required}"

mkdir -p "$EVIDENCE_DIR"

node <<'NODE'
const allowed = new Set(['localhost', '127.0.0.1', '::1']);
for (const name of ['DATABASE_URL', 'PSQL_URL', 'POSTGRES_ADMIN_URL', 'RESTORE_URL']) {
  const raw = process.env[name];
  const url = new URL(raw);
  if (!allowed.has(url.hostname)) {
    console.error(`REFUSED: ${name} host ${url.hostname} is not disposable localhost.`);
    process.exit(2);
  }
  if (url.hostname.includes('neon.tech') || url.pathname.replace(/^\//, '') === 'neondb') {
    console.error(`REFUSED: ${name} resembles the production Neon target.`);
    process.exit(2);
  }
}
NODE

echo "PASS: all database targets are disposable localhost" | tee "$EVIDENCE_DIR/safety-guard.txt"

npx prisma validate --schema=prisma/schema.prisma 2>&1 | tee "$EVIDENCE_DIR/prisma-validate.log"
npx prisma generate --schema=prisma/schema.prisma 2>&1 | tee "$EVIDENCE_DIR/prisma-generate.log"

# This db push is deliberately restricted by the localhost guard above and is
# used only to materialize the current schema in an ephemeral CI database.
npx prisma db push --skip-generate 2>&1 | tee "$EVIDENCE_DIR/disposable-db-push.log"

psql "$PSQL_URL" -v ON_ERROR_STOP=1 -Atc \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('User','Session','OtpToken');" \
  | tee "$EVIDENCE_DIR/source-required-table-count.txt"
psql "$PSQL_URL" -v ON_ERROR_STOP=1 -Atc \
  "SELECT count(*) FROM pg_indexes WHERE schemaname='public' AND tablename='OtpToken' AND indexname='OtpToken_email_purpose_idx';" \
  | tee "$EVIDENCE_DIR/source-otp-index-count.txt"

test "$(tr -d '\r\n ' < "$EVIDENCE_DIR/source-required-table-count.txt")" = "3"
test "$(tr -d '\r\n ' < "$EVIDENCE_DIR/source-otp-index-count.txt")" = "1"

pg_dump "$PSQL_URL" \
  --schema-only \
  --no-owner \
  --no-privileges \
  --file "$EVIDENCE_DIR/schema-backup.sql"
test -s "$EVIDENCE_DIR/schema-backup.sql"
sha256sum "$EVIDENCE_DIR/schema-backup.sql" | tee "$EVIDENCE_DIR/schema-backup.sha256"

psql "$POSTGRES_ADMIN_URL" -v ON_ERROR_STOP=1 -c 'DROP DATABASE IF EXISTS naksharix_restore_rehearsal;'
psql "$POSTGRES_ADMIN_URL" -v ON_ERROR_STOP=1 -c 'CREATE DATABASE naksharix_restore_rehearsal;'
psql "$RESTORE_URL" -v ON_ERROR_STOP=1 -f "$EVIDENCE_DIR/schema-backup.sql" \
  2>&1 | tee "$EVIDENCE_DIR/restore-apply.log"

inventory_query="COPY (
  SELECT 'COLUMN' AS kind,
         table_name AS object_name,
         column_name AS item_name,
         data_type || '|' || is_nullable || '|' || COALESCE(column_default, '') AS definition
  FROM information_schema.columns
  WHERE table_schema='public'
  UNION ALL
  SELECT 'INDEX', tablename, indexname, indexdef
  FROM pg_indexes
  WHERE schemaname='public'
  UNION ALL
  SELECT 'TABLE', table_name, '', table_type
  FROM information_schema.tables
  WHERE table_schema='public'
  ORDER BY 1,2,3,4
) TO STDOUT WITH CSV"

psql "$PSQL_URL" -v ON_ERROR_STOP=1 -c "$inventory_query" > "$EVIDENCE_DIR/source-inventory.csv"
psql "$RESTORE_URL" -v ON_ERROR_STOP=1 -c "$inventory_query" > "$EVIDENCE_DIR/restore-inventory.csv"
diff -u "$EVIDENCE_DIR/source-inventory.csv" "$EVIDENCE_DIR/restore-inventory.csv" \
  | tee "$EVIDENCE_DIR/inventory.diff"

psql "$RESTORE_URL" -v ON_ERROR_STOP=1 -Atc \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('User','Session','OtpToken');" \
  | tee "$EVIDENCE_DIR/restore-required-table-count.txt"
psql "$RESTORE_URL" -v ON_ERROR_STOP=1 -Atc \
  "SELECT count(*) FROM pg_indexes WHERE schemaname='public' AND tablename='OtpToken' AND indexname='OtpToken_email_purpose_idx';" \
  | tee "$EVIDENCE_DIR/restore-otp-index-count.txt"

test "$(tr -d '\r\n ' < "$EVIDENCE_DIR/restore-required-table-count.txt")" = "3"
test "$(tr -d '\r\n ' < "$EVIDENCE_DIR/restore-otp-index-count.txt")" = "1"

{
  echo "environment=disposable_postgresql"
  echo "source_schema_materialized=PASS"
  echo "schema_backup_created=PASS"
  echo "separate_restore_database_created=PASS"
  echo "restore_apply=PASS"
  echo "source_restore_inventory_match=PASS"
  echo "otp_required_schema=PASS"
  echo "production_database_touched=false"
  echo "production_database_writes=zero"
  echo "production_migrations_executed=zero"
} | tee "$EVIDENCE_DIR/summary.txt"
