/**
 * CI disposable PostgreSQL only. Prisma db push currently creates a nullable
 * text[] for PujaPartner.traditions, while the reviewed add-only production SQL
 * requires NOT NULL. Align ONLY CI ephemeral schema before exercising R2 checks.
 * Never targets live Neon or any non-disposable environment.
 */
import { PrismaClient } from "@prisma/client";

if (process.env.CI !== "true" || !process.env.DATABASE_URL) {
  throw new Error("CI_DISPOSABLE_FEATURE_SCHEMA_ONLY");
}
const database = new URL(process.env.DATABASE_URL);
if (database.protocol !== "postgresql:" && database.protocol !== "postgres:") {
  throw new Error("CI_NON_POSTGRES_DATABASE_REFUSED");
}
if (!["localhost", "127.0.0.1", "postgres"].includes(database.hostname) ||
    !["/naksharix", "/naksharix_browser"].includes(database.pathname)) {
  throw new Error("CI_DISPOSABLE_TARGET_NOT_ALLOWLISTED");
}
const client = new PrismaClient();
try {
  await client.$executeRaw`ALTER TABLE public."PujaPartner" ALTER COLUMN "traditions" SET NOT NULL`;
  const fields = await client.$queryRaw`SELECT is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='PujaPartner' AND column_name='traditions'`;
  if (fields.length !== 1 || fields[0].is_nullable !== "NO") {
    throw new Error("CI_PUJA_TRADITIONS_NOT_NULL_GATE_FAILED");
  }
  console.log("CI_DISPOSABLE_FEATURE_SCHEMA_ALIGN=PASS");
  console.log("PRODUCTION_DATABASE_TARGET=NO;PRODUCTION_DATABASE_WRITES=ZERO");
} finally {
  await client.$disconnect();
}
