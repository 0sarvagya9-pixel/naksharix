import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. This script never writes to the database.");
  process.exit(2);
}

const prisma = new PrismaClient();
const results = [];

function record(status, name, detail) {
  results.push({ status, name, detail });
  console.log(`${status}: ${name}${detail ? ` - ${detail}` : ""}`);
}

async function query(sql) {
  return prisma.$queryRawUnsafe(sql);
}

try {
  const readOnly = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    return tx.$queryRawUnsafe("SHOW transaction_read_only");
  });
  const mode = String(readOnly?.[0]?.transaction_read_only ?? "");
  record(mode === "on" ? "PASSED" : "FAILED", "Read-only transaction enforcement", mode || "unknown");

  const requiredTables = ["User", "Session", "OtpToken", "ReportRequest", "Payment", "ConsultationBooking", "AstrologerProfile"];
  const tableRows = await query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `);
  const tableSet = new Set(tableRows.map((row) => row.table_name));
  for (const table of requiredTables) {
    record(tableSet.has(table) ? "PASSED" : "FAILED", `Required table ${table}`, tableSet.has(table) ? "present" : "missing");
  }

  const requiredColumns = {
    User: ["id", "email", "passwordHash", "emailVerified", "emailVerifiedAt", "role"],
    Session: ["userId", "tokenHash", "expiresAt", "revokedAt"],
    OtpToken: ["id", "userId", "email", "purpose", "codeHash", "attempts", "expiresAt", "consumedAt", "createdAt"],
    ReportRequest: ["id", "userId", "deliveryEmail", "generatedPdfBytes", "generatedPdfSize", "deliveryStatus", "emailSentAt"],
    ConsultationBooking: ["id", "userId", "astrologerProfileId", "status", "paymentStatus", "scheduledAt", "metadata"]
  };
  const columnRows = await query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
  `);
  const columns = new Map();
  for (const row of columnRows) {
    if (!columns.has(row.table_name)) columns.set(row.table_name, new Set());
    columns.get(row.table_name).add(row.column_name);
  }
  for (const [table, names] of Object.entries(requiredColumns)) {
    for (const name of names) {
      const present = columns.get(table)?.has(name) === true;
      record(present ? "PASSED" : "FAILED", `${table}.${name}`, present ? "present" : "missing");
    }
  }

  const duplicates = await query(`
    SELECT lower(email) AS normalized_email, count(*)::int AS count
    FROM "User"
    WHERE email IS NOT NULL
    GROUP BY lower(email)
    HAVING count(*) > 1
    LIMIT 20
  `);
  record(duplicates.length === 0 ? "PASSED" : "FAILED", "Case-insensitive email uniqueness", duplicates.length ? `${duplicates.length} collisions` : "no collisions");

  const migrationRows = await query(`
    SELECT CASE WHEN to_regclass('public."_prisma_migrations"') IS NULL THEN false ELSE true END AS present
  `);
  const migrationsPresent = migrationRows?.[0]?.present === true;
  record(migrationsPresent ? "PASSED" : "REVIEW_REQUIRED", "Prisma migration history", migrationsPresent ? "_prisma_migrations present" : "_prisma_migrations missing; baseline governance required before any deploy migration");

  const indexRows = await query(`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'OtpToken'
  `);
  const indexNames = new Set(indexRows.map((row) => row.indexname));
  record(indexNames.has("OtpToken_email_purpose_idx") ? "PASSED" : "FAILED", "OTP email/purpose index", [...indexNames].join(", ") || "none");

  const failures = results.filter((entry) => entry.status === "FAILED");
  console.log(`\nProduction DB read-only QA summary: ${JSON.stringify({ passed: results.filter((entry) => entry.status === "PASSED").length, reviewRequired: results.filter((entry) => entry.status === "REVIEW_REQUIRED").length, failed: failures.length })}`);
  console.log("DATABASE_WRITES_PERFORMED=ZERO");
  console.log("MIGRATIONS_EXECUTED=ZERO");
  if (failures.length) process.exitCode = 1;
} catch (error) {
  console.error("FAILED: Production DB read-only audit", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
