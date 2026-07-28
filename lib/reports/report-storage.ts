import "server-only";
import { saveReportPdf } from "@/lib/storage/report-storage";

export async function createDatabaseBackedReportPdf(input: {
  reportRequestId: string;
  reportSlug: string;
  bytes: Buffer | Uint8Array;
}) {
  const stored = await saveReportPdf(input);
  return { ...stored, storageProvider: stored.storageDriver };
}
