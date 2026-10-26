import "server-only";

export type CredentialEvidence = {
  credentialName: string;
  issuer: string;
  issuedYear: number;
  referenceUrl: string;
};
export type CredentialState = {
  evidence: CredentialEvidence | null;
  reviewStatus: "PENDING" | "DOCUMENTS_REVIEWED" | "REJECTED";
  reviewedAt: string | null;
  reviewedBy: string | null;
};
export function credentialState(raw: unknown): CredentialState {
  const empty: CredentialState = {
    evidence: null, reviewStatus: "PENDING", reviewedAt: null, reviewedBy: null
  };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return empty;
  const value = raw as Record<string, unknown>;
  const data = value.evidence;
  if (!data || typeof data !== "object" || Array.isArray(data)) return empty;
  const doc = data as Record<string, unknown>;
  if (typeof doc.credentialName !== "string" ||
      typeof doc.issuer !== "string" || typeof doc.referenceUrl !== "string" ||
      typeof doc.issuedYear !== "number") return empty;
  return {
    evidence: {
      credentialName: doc.credentialName,
      issuer: doc.issuer,
      referenceUrl: doc.referenceUrl,
      issuedYear: doc.issuedYear
    },
    reviewStatus: value.reviewStatus === "DOCUMENTS_REVIEWED" ||
      value.reviewStatus === "REJECTED" ? value.reviewStatus : "PENDING",
    reviewedAt: typeof value.reviewedAt === "string" ? value.reviewedAt : null,
    reviewedBy: typeof value.reviewedBy === "string" ? value.reviewedBy : null
  };
}
