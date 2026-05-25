import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { getPremiumEngineActivationStatus } from "@/lib/astrology/premium-engine/activation-status";
import type { PremiumReportContentResult } from "@/lib/reports/premium-report-content-engine";
import { premiumReportAutomationStatus, type PremiumReportGenerationStatus } from "@/lib/reports/premium-report-types";

export type PremiumReportGenerationRequest = {
  requestId: string;
  templateId: string;
  status: PremiumReportGenerationStatus;
  content?: PremiumReportContentResult;
  reviewedByAdmin?: boolean;
};

export type PremiumReportGenerationResult =
  | {
      generated: true;
      status: "generated_internal_unverified";
      pdfUrl: null;
      bytes: Buffer;
      byteLength: number;
      deliveryEnabled: false;
      reason: string;
    }
  | {
      generated: false;
      status: "blocked_until_verified_chart_and_workflow" | "blocked_until_admin_review" | "blocked_until_report_content";
      pdfUrl: null;
      bytes?: undefined;
      byteLength?: undefined;
      deliveryEnabled: false;
      reason: string;
    };

const styles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: "#020612",
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "Helvetica"
  },
  title: {
    color: "#f3d382",
    fontSize: 20,
    marginBottom: 8
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 10,
    marginBottom: 18
  },
  section: {
    border: "1 solid #1e293b",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#0a1224"
  },
  sectionTitle: {
    color: "#f3d382",
    fontSize: 12,
    marginBottom: 5
  },
  body: {
    color: "#e5e7eb",
    lineHeight: 1.35
  },
  muted: {
    color: "#94a3b8",
    fontSize: 8,
    marginTop: 4
  }
});

export async function generatePremiumReportPdf(request: PremiumReportGenerationRequest): Promise<PremiumReportGenerationResult> {
  const pdfStatus = getPremiumEngineActivationStatus("pdf_generation");

  if (!request.content) {
    return blocked("blocked_until_report_content", "Report content must be assembled from real engine output before PDF generation.");
  }

  if (!request.reviewedByAdmin) {
    return blocked("blocked_until_admin_review", "Internal PDF generation requires admin review before any file is created.");
  }

  const document = React.createElement(
    Document,
    {
      title: `Naksharix Premium Report ${request.requestId}`,
      author: "Naksharix",
      subject: "Internal reviewed premium astrology report draft"
    },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.title }, "Naksharix Premium Report Draft"),
      React.createElement(
        Text,
        { style: styles.subtitle },
        "Internal reviewed PDF draft. Delivery and payment workflow are not enabled by this generator."
      ),
      ...request.content.sections.map((section) =>
        React.createElement(
          View,
          { key: section.key, style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, `${section.title} (${section.status})`),
          React.createElement(Text, { style: styles.body }, summarizeSectionData(section.data)),
          section.limitations.length
            ? React.createElement(Text, { style: styles.muted }, `Limitations: ${section.limitations.join(" ")}`)
            : null
        )
      ),
      React.createElement(
        Text,
        { style: styles.muted },
        `Public status: ${pdfStatus.status}. No public download URL or automated delivery is enabled.`
      )
    )
  );

  const bytes = await renderToBuffer(document);

  return {
    generated: true,
    status: "generated_internal_unverified",
    pdfUrl: null,
    bytes,
    byteLength: bytes.byteLength,
    deliveryEnabled: false,
    reason: "A real internal PDF buffer was generated for reviewed content only. It is not delivered or exposed publicly."
  };
}

function blocked(status: Exclude<PremiumReportGenerationResult["status"], "generated_internal_unverified">, reason: string): PremiumReportGenerationResult {
  return {
    generated: false,
    status,
    pdfUrl: null,
    deliveryEnabled: false,
    reason
  };
}

function summarizeSectionData(data: unknown) {
  if (data == null) return "Section data is unavailable.";
  if (typeof data === "string") return data;
  if (typeof data === "number" || typeof data === "boolean") return String(data);
  if (Array.isArray(data)) return data.slice(0, 12).map((item, index) => `${index + 1}. ${summarizeInline(item)}`).join("\n");
  if (typeof data === "object") {
    return Object.entries(data as Record<string, unknown>)
      .slice(0, 18)
      .map(([key, value]) => `${labelize(key)}: ${summarizeInline(value)}`)
      .join("\n");
  }
  return "Section data is available in a non-display format.";
}

function summarizeInline(value: unknown): string {
  if (value == null) return "Not available";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.length ? `${value.length} entries` : "No entries";
  if (typeof value === "object") {
    const fields = Object.entries(value as Record<string, unknown>)
      .slice(0, 5)
      .map(([key, nestedValue]) => `${labelize(key)} ${inlineScalar(nestedValue)}`);
    return fields.join(", ");
  }
  return "Available";
}

function inlineScalar(value: unknown) {
  if (value == null) return "not available";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.length ? `${value.length} entries` : "no entries";
  return "available";
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/[_-]+/g, " ").replace(/^./, (first) => first.toUpperCase());
}

export function getPremiumReportPublicDeliveryStatus() {
  return {
    generated: false,
    pdfUrl: null,
    deliveryEnabled: false,
    status: "blocked_until_verified_chart_and_workflow" as const,
    reason: premiumReportAutomationStatus.publicClaimBoundary
  };
}
