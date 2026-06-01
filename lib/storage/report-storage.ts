import "server-only";
import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import type { ReportStorageReadiness, StoredReportPdf } from "@/lib/storage/types";

export function getReportStorageReadiness(): ReportStorageReadiness {
  const driver = env.REPORT_STORAGE_DRIVER;
  if (driver === "r2") {
    const missing = [
      env.CLOUDFLARE_R2_ACCOUNT_ID ? null : "CLOUDFLARE_R2_ACCOUNT_ID",
      env.CLOUDFLARE_R2_ACCESS_KEY_ID ? null : "CLOUDFLARE_R2_ACCESS_KEY_ID",
      env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? null : "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
      env.CLOUDFLARE_R2_BUCKET ? null : "CLOUDFLARE_R2_BUCKET"
    ].filter(Boolean) as string[];
    return {
      driver,
      activeDriver: "database",
      enabled: missing.length === 0,
      missing,
      reason: missing.length ? "R2 storage is not configured; DB-backed secure storage remains active." : "R2 env is present, but the cloud upload adapter is intentionally not active without SDK wiring."
    };
  }
  if (driver === "s3") {
    const missing = [
      env.AWS_ACCESS_KEY_ID ? null : "AWS_ACCESS_KEY_ID",
      env.AWS_SECRET_ACCESS_KEY ? null : "AWS_SECRET_ACCESS_KEY",
      env.AWS_REGION ? null : "AWS_REGION",
      env.AWS_S3_BUCKET ? null : "AWS_S3_BUCKET"
    ].filter(Boolean) as string[];
    return {
      driver,
      activeDriver: "database",
      enabled: missing.length === 0,
      missing,
      reason: missing.length ? "S3 storage is not configured; DB-backed secure storage remains active." : "S3 env is present, but the cloud upload adapter is intentionally not active without SDK wiring."
    };
  }
  return {
    driver: "database",
    activeDriver: "database",
    enabled: true,
    missing: [],
    reason: "Database-backed PDF storage is active and secured by the download API."
  };
}

export function saveReportPdf(input: {
  reportRequestId: string;
  reportSlug: string;
  bytes: Buffer | Uint8Array;
}): StoredReportPdf {
  const sourceBytes = input.bytes instanceof Uint8Array ? input.bytes : new Uint8Array(input.bytes);
  const bytes = new Uint8Array(sourceBytes.byteLength);
  bytes.set(sourceBytes);
  const checksum = createHash("sha256").update(bytes).digest("hex");
  const safeSlug = input.reportSlug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  return {
    bytes,
    fileName: `naksharix-${safeSlug}-${input.reportRequestId}.pdf`,
    mimeType: "application/pdf",
    size: bytes.byteLength,
    checksum,
    storageKey: `db://report-requests/${input.reportRequestId}/generated-pdf`,
    storageDriver: "database",
    publicUrl: null
  };
}
