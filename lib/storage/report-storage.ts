import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { getPrivateObject, putPrivateObject } from "@/lib/storage/s3-compatible";
import type { ReportStorageDriver, ReportStorageReadiness, StoredReportPdf } from "@/lib/storage/types";

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
      activeDriver: driver,
      enabled: missing.length === 0,
      missing,
      reason: missing.length ? "R2 storage is selected but not fully configured." : "Private R2 object storage is active for generated report PDFs."
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
      activeDriver: driver,
      enabled: missing.length === 0,
      missing,
      reason: missing.length ? "S3 storage is selected but not fully configured." : "Private AWS S3 object storage is active for generated report PDFs."
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

function cloneBytes(value: Buffer | Uint8Array) {
  const source = value instanceof Uint8Array ? value : new Uint8Array(value);
  const bytes = new Uint8Array(source.byteLength);
  bytes.set(source);
  return bytes;
}

function storageObjectKey(reportRequestId: string, safeSlug: string) {
  return `reports/${reportRequestId}/naksharix-${safeSlug}-${reportRequestId}.pdf`;
}

export async function saveReportPdf(input: {
  reportRequestId: string;
  reportSlug: string;
  bytes: Buffer | Uint8Array;
}): Promise<StoredReportPdf> {
  const bytes = cloneBytes(input.bytes);
  const checksum = createHash("sha256").update(bytes).digest("hex");
  const safeSlug = input.reportSlug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const fileName = `naksharix-${safeSlug}-${input.reportRequestId}.pdf`;
  const readiness = getReportStorageReadiness();

  if (!readiness.enabled) throw new Error(readiness.reason);

  if (readiness.activeDriver === "database") {
    return {
      bytes,
      fileName,
      mimeType: "application/pdf",
      size: bytes.byteLength,
      checksum,
      storageKey: `db://report-requests/${input.reportRequestId}/generated-pdf`,
      storageDriver: "database",
      publicUrl: null
    };
  }

  const key = storageObjectKey(input.reportRequestId, safeSlug);
  await putPrivateObject(readiness.activeDriver, key, bytes, "application/pdf");
  return {
    bytes: null,
    fileName,
    mimeType: "application/pdf",
    size: bytes.byteLength,
    checksum,
    storageKey: key,
    storageDriver: readiness.activeDriver,
    publicUrl: null
  };
}

function checksumMatches(bytes: Uint8Array, expected: string | null | undefined) {
  if (!expected || !/^[a-f0-9]{64}$/i.test(expected)) return true;
  const actual = createHash("sha256").update(bytes).digest();
  const expectedBytes = Buffer.from(expected, "hex");
  return actual.length === expectedBytes.length && timingSafeEqual(actual, expectedBytes);
}

export async function loadReportPdf(input: {
  storageDriver: string | null | undefined;
  storageKey: string | null | undefined;
  databaseBytes: Uint8Array | Buffer | null | undefined;
  expectedChecksum?: string | null;
}) {
  const driver = (input.storageDriver ?? "database") as ReportStorageDriver;
  let bytes: Uint8Array;

  if (driver === "database") {
    if (!input.databaseBytes) throw new Error("Database-backed report bytes are missing.");
    bytes = cloneBytes(input.databaseBytes);
  } else {
    if (!input.storageKey || input.storageKey.startsWith("db://")) throw new Error("Private object storage key is missing.");
    bytes = await getPrivateObject(driver, input.storageKey);
  }

  if (!checksumMatches(bytes, input.expectedChecksum)) {
    throw new Error("Stored report checksum verification failed.");
  }
  return bytes;
}
