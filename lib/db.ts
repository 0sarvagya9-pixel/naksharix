import "server-only";
import { PrismaClient } from "@prisma/client";
import { neonRuntimeDatabaseUrl } from "@/lib/db-transient";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const neonDatasourceUrl = neonRuntimeDatabaseUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(neonDatasourceUrl ? { datasourceUrl: neonDatasourceUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
