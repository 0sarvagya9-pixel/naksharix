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
          AND EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='LearningProgress'
            AND column_name='completedAt')
          AND EXISTS (SELECT 1 FROM pg_indexes
            WHERE schemaname='public' AND tablename='LearningProgress'
            AND indexname='LearningProgress_userId_lessonId_key')
        ) AS present
      UNION ALL
      SELECT 'PujaPartner'::text,
        (
          to_regclass('public."PujaPartner"') IS NOT NULL
          AND EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='PujaPartner'
            AND column_name='reviewStatus')
          AND EXISTS (SELECT 1 FROM pg_indexes
            WHERE schemaname='public' AND tablename='PujaPartner'
            AND indexname='PujaPartner_reviewStatus_createdAt_idx')
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
