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

# Deliberately restricted by the localhost guard above. This materializes the
# current schema only in the ephemeral CI source database.
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

# Compare semantic definitions, not generated catalog names. PostgreSQL exposes
# NOT NULL entries through information_schema with object-id-derived names such
# as 2200_16587_1_not_null; those names legitimately change after restore.
# Nullability is already compared through information_schema.columns.
inventory_query="COPY (
  SELECT 'COLUMN' AS kind,
         table_name AS object_name,
         column_name AS item_name,
         data_type || '|' || is_nullable || '|' || COALESCE(column_default, '') AS definition
  FROM information_schema.columns
  WHERE table_schema='public'
  UNION ALL
  SELECT 'INDEX', tablename, indexname, regexp_replace(indexdef, '\\s+', ' ', 'g')
  FROM pg_indexes
  WHERE schemaname='public'
  UNION ALL
  SELECT 'TABLE', table_name, '', table_type
  FROM information_schema.tables
  WHERE table_schema='public'
  UNION ALL
  SELECT 'CONSTRAINT',
         c.conrelid::regclass::text,
         c.contype::text,
         regexp_replace(pg_get_constraintdef(c.oid, true), '\\s+', ' ', 'g')
  FROM pg_constraint c
  JOIN pg_namespace n ON n.oid = c.connamespace
  WHERE n.nspname='public' AND c.conrelid <> 0
  UNION ALL
  SELECT 'ENUM',
         t.typname,
         e.enumsortorder::text,
         e.enumlabel
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  JOIN pg_enum e ON e.enumtypid = t.oid
  WHERE n.nspname='public'
  ORDER BY 1,2,3,4
) TO STDOUT WITH CSV"

psql "$PSQL_URL" -v ON_ERROR_STOP=1 -c "$inventory_query" > "$EVIDENCE_DIR/source-inventory.csv"
psql "$RESTORE_URL" -v ON_ERROR_STOP=1 -c "$inventory_query" > "$EVIDENCE_DIR/restore-inventory.csv"

if ! diff -u "$EVIDENCE_DIR/source-inventory.csv" "$EVIDENCE_DIR/restore-inventory.csv" \
  > "$EVIDENCE_DIR/inventory.diff"; then
  cat "$EVIDENCE_DIR/inventory.diff"
  echo "FAILED: source and restored semantic inventories differ" >&2
  exit 1
fi

echo "PASS: source and restored semantic inventories match" | tee "$EVIDENCE_DIR/inventory-match.txt"

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
  echo "source_restore_semantic_inventory_match=PASS"
  echo "otp_required_schema=PASS"
  echo "production_database_touched=false"
  echo "production_database_writes=zero"
  echo "production_migrations_executed=zero"
} | tee "$EVIDENCE_DIR/summary.txt"
