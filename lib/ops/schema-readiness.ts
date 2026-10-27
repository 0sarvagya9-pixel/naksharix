import "server-only";
import { prisma } from "@/lib/db";

export type SchemaGate = {
  ready: boolean;
  checks: { object: string; present: boolean }[];
  missingCount: number;
};

// SELECT-only catalog inspection; never edits, creates or migrates a table.
// Keep public health routes coarse and expose these details only to admins.
export async function getSchemaReadiness(): Promise<SchemaGate> {
  const rows = await prisma.$queryRaw<Array<{name: string; present: boolean}>>`
    SELECT checks.name, checks.present
    FROM (
      SELECT 'LearningProgress'::text AS name,
        (
          to_regclass('public."LearningProgress"') IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM (VALUES
              ('id', 'text', true), ('userId', 'text', true),
              ('lessonId', 'text', true),
              ('completedAt', 'timestamp without time zone', false),
              ('createdAt', 'timestamp without time zone', true),
              ('updatedAt', 'timestamp without time zone', true)
            ) AS required(column_name, data_type, must_not_be_null)
            WHERE NOT EXISTS (
              SELECT 1 FROM information_schema.columns c
              WHERE c.table_schema='public' AND c.table_name='LearningProgress'
                AND c.column_name=required.column_name
                AND c.data_type=required.data_type
                AND (NOT required.must_not_be_null OR c.is_nullable='NO')
                AND (c.data_type <> 'timestamp without time zone'
                  OR c.datetime_precision=3)
            )
          )
          AND EXISTS (
            SELECT 1 FROM pg_index i
            JOIN pg_class idx ON idx.oid=i.indexrelid
            JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=i.indkey[0]
            WHERE i.indrelid=to_regclass('public."LearningProgress"')
              AND idx.relname='LearningProgress_pkey' AND i.indisprimary
              AND i.indisvalid AND i.indisready AND i.indnkeyatts=1
              AND a.attname='id'
          )
          AND EXISTS (
            SELECT 1 FROM pg_constraint f
            WHERE f.conrelid=to_regclass('public."LearningProgress"')
              AND f.confrelid=to_regclass('public."User"')
              AND f.conname='LearningProgress_userId_fkey'
              AND f.contype='f' AND f.convalidated
              AND f.confdeltype='c' AND f.confupdtype='c'
              AND cardinality(f.conkey)=1 AND cardinality(f.confkey)=1
              AND EXISTS (SELECT 1 FROM pg_attribute a
                WHERE a.attrelid=f.conrelid AND a.attname='userId'
                  AND a.attnum=ANY(f.conkey))
              AND EXISTS (SELECT 1 FROM pg_attribute a
                WHERE a.attrelid=f.confrelid AND a.attname='id'
                  AND a.attnum=ANY(f.confkey))
          )
          AND EXISTS (
            SELECT 1 FROM pg_index i
            JOIN pg_class idx ON idx.oid=i.indexrelid
            WHERE i.indrelid=to_regclass('public."LearningProgress"')
              AND idx.relname='LearningProgress_userId_lessonId_key'
              AND i.indisvalid AND i.indisready AND i.indisunique
              AND i.indnkeyatts=2 AND i.indpred IS NULL AND i.indexprs IS NULL
              AND EXISTS (SELECT 1 FROM pg_attribute a
                WHERE a.attrelid=i.indrelid AND a.attname='userId'
                  AND a.attnum=i.indkey[0])
              AND EXISTS (SELECT 1 FROM pg_attribute a
                WHERE a.attrelid=i.indrelid AND a.attname='lessonId'
                  AND a.attnum=i.indkey[1])
          )
          AND EXISTS (
            SELECT 1 FROM pg_index i
            JOIN pg_class idx ON idx.oid=i.indexrelid
            WHERE i.indrelid=to_regclass('public."LearningProgress"')
              AND idx.relname='LearningProgress_userId_completedAt_idx'
              AND i.indisvalid AND i.indisready AND i.indnkeyatts=2
              AND i.indpred IS NULL AND i.indexprs IS NULL
              AND EXISTS (SELECT 1 FROM pg_attribute a
                WHERE a.attrelid=i.indrelid AND a.attname='userId'
                  AND a.attnum=i.indkey[0])
              AND EXISTS (SELECT 1 FROM pg_attribute a
                WHERE a.attrelid=i.indrelid AND a.attname='completedAt'
                  AND a.attnum=i.indkey[1])
          )
        ) AS present
      UNION ALL
      SELECT 'PujaPartner'::text,
        (
          to_regclass('public."PujaPartner"') IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM (VALUES
              ('id', 'text', true), ('name', 'text', true),
              ('region', 'text', true), ('traditions', 'ARRAY', true),
              ('evidenceUrl', 'text', false), ('reviewStatus', 'text', true),
              ('reviewedById', 'text', false),
              ('reviewedAt', 'timestamp without time zone', false),
              ('reviewNote', 'text', false),
              ('createdAt', 'timestamp without time zone', true),
              ('updatedAt', 'timestamp without time zone', true)
            ) AS required(column_name, data_type, must_not_be_null)
            WHERE NOT EXISTS (
              SELECT 1 FROM information_schema.columns c
              WHERE c.table_schema='public' AND c.table_name='PujaPartner'
                AND c.column_name=required.column_name
                AND c.data_type=required.data_type
                AND (NOT required.must_not_be_null OR c.is_nullable='NO')
                AND (required.column_name <> 'traditions' OR c.udt_name='_text')
                AND (c.data_type <> 'timestamp without time zone'
                  OR c.datetime_precision=3)
            )
          )
          AND EXISTS (
            SELECT 1 FROM pg_index i
            JOIN pg_class idx ON idx.oid=i.indexrelid
            JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=i.indkey[0]
            WHERE i.indrelid=to_regclass('public."PujaPartner"')
              AND idx.relname='PujaPartner_pkey' AND i.indisprimary
              AND i.indisvalid AND i.indisready AND i.indnkeyatts=1
              AND a.attname='id'
          )
          AND EXISTS (
            SELECT 1 FROM pg_index i
            JOIN pg_class idx ON idx.oid=i.indexrelid
            WHERE i.indrelid=to_regclass('public."PujaPartner"')
              AND idx.relname='PujaPartner_reviewStatus_createdAt_idx'
              AND i.indisvalid AND i.indisready AND i.indnkeyatts=2
              AND i.indpred IS NULL AND i.indexprs IS NULL
              AND EXISTS (SELECT 1 FROM pg_attribute a
                WHERE a.attrelid=i.indrelid AND a.attname='reviewStatus'
                  AND a.attnum=i.indkey[0])
              AND EXISTS (SELECT 1 FROM pg_attribute a
                WHERE a.attrelid=i.indrelid AND a.attname='createdAt'
                  AND a.attnum=i.indkey[1])
          )
        )
    ) AS checks ORDER BY checks.name
  `;
  const checks = rows.map((r) => ({ object: r.name, present: r.present === true }));
  return {
    ready: checks.length === 2 && checks.every((r) => r.present),
    missingCount: checks.filter((r) => !r.present).length,
    checks
  };
}
