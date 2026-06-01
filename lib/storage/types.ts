import "server-only";

export type ReportStorageDriver = "database" | "r2" | "s3";

export type ReportStorageReadiness = {
  driver: ReportStorageDriver;
  activeDriver: "database";
  enabled: boolean;
  missing: string[];
  reason: string;
};

export type StoredReportPdf = {
  bytes: Uint8Array<ArrayBuffer>;
  fileName: string;
  mimeType: "application/pdf";
  size: number;
  checksum: string;
  storageKey: string;
  storageDriver: "database";
  publicUrl: null;
};
