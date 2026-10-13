import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
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

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT = 42;
const TEXT_WIDTH = PAGE_WIDTH - LEFT * 2;
const GOLD = rgb(0.68, 0.45, 0.12);
const INK = rgb(0.08, 0.13, 0.23);
const MUTED = rgb(0.34, 0.4, 0.5);
const WHITE = rgb(1, 1, 1);

function blocked(
  status: Exclude<PremiumReportGenerationResult["status"], "generated_internal_unverified">,
  reason: string
): PremiumReportGenerationResult {
  return { generated: false, status, pdfUrl: null, deliveryEnabled: false, reason };
}

function readableText(value: unknown): string {
  if (value == null) return "Unavailable";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.slice(0, 14).map((item, index) => String(index + 1) + ". " + readableInline(item)).join("\n");
  if (typeof value === "object") return Object.entries(value as Record<string, unknown>)
    .slice(0, 22).map(([key, item]) => labelize(key) + ": " + readableInline(item)).join("\n");
  return "Data available";
}

function readableInline(value: unknown): string {
  if (value == null) return "not available";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.length + " entries";
  if (typeof value === "object") return Object.entries(value as Record<string, unknown>).slice(0, 6)
    .map(([key, item]) => labelize(key) + " " + (item && typeof item === "object" ? "available" : String(item ?? "not available"))).join(", ");
  return "Available";
}
function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/[_-]+/g, " ").replace(/^./, (first) => first.toUpperCase());
}

// Use the bundled fonts so English and Devanagari reports do not rely on React rendering.
async function loadReportFont(pdf: PDFDocument): Promise<PDFFont> {
  pdf.registerFontkit(fontkit);
  const bytes = await readFile(path.join(process.cwd(), "public", "fonts", "NotoSansDevanagari-Regular.ttf"));
  return pdf.embedFont(bytes, { subset: true });
}
function safePrint(value: string) {
  // Disallow control characters, emoji and unsupported scripts; preserve Latin and Devanagari.
  return value.replace(/\r/g, "").replace(/[^\u0009\u000A\u0020-\u007E\u00A0-\u00FF\u0900-\u097F]/gu, " ");
}
function wrapLine(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  let current = "";
  for (const word of safePrint(text).split(/\s+/).filter(Boolean)) {
    const proposal = current ? current + " " + word : word;
    if (font.widthOfTextAtSize(proposal, size) <= width) {
      current = proposal;
      continue;
    }
    if (current) out.push(current);
    current = "";
    for (const character of Array.from(word)) {
      const test = current + character;
      if (current && font.widthOfTextAtSize(test, size) > width) {
        out.push(current);
        current = character;
      } else {
        current = test;
      }
    }
  }
  if (current) out.push(current);
  return out.length ? out : [""];
}

export async function generatePremiumReportPdf(request: PremiumReportGenerationRequest): Promise<PremiumReportGenerationResult> {
  const status = getPremiumEngineActivationStatus("pdf_generation");
  if (!request.content) return blocked("blocked_until_report_content", "Real chart-based report content is required.");
  if (!request.reviewedByAdmin) return blocked("blocked_until_admin_review", "Admin review is required before creating a report PDF.");

  const pdf = await PDFDocument.create();
  pdf.setTitle("Naksharix Premium Report " + request.requestId);
  pdf.setAuthor("Naksharix");
  pdf.setSubject("Reviewed astrological chart report with calculation limitations");
  const font = await loadReportFont(pdf);
  let page: PDFPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 52;

  const newPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - 52;
  };
  const ensure = (height: number) => {
    if (y < 55 + height) newPage();
  };
  const writeLine = (line: string, size: number, color = INK, gap = 1.45) => {
    const height = size * gap;
    ensure(height);
    page.drawText(line || " ", { x: LEFT, y, font, size, color, maxWidth: TEXT_WIDTH });
    y -= height;
  };
  const writeParagraph = (text: string, size = 9.5, color = INK, space = 8) => {
    for (const sourceLine of String(text).split(/\n/)) {
      for (const line of wrapLine(sourceLine, font, size, TEXT_WIDTH)) writeLine(line, size, color);
    }
    y -= space;
  };

  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 106, width: PAGE_WIDTH, height: 106, color: rgb(0.04, 0.1, 0.19) });
  writeLine("NAKSHARIX  |  PREMIUM ASTROLOGY REPORT", 18, WHITE, 1.5);
  writeLine("Prepared from Naksharix internal astrology calculations", 10, WHITE, 2.3);
  y -= 20;
  writeParagraph("Reference: " + request.requestId, 9, MUTED);
  writeParagraph("Report type: " + request.templateId, 9, MUTED);

  for (const section of request.content.sections) {
    const title = safePrint(section.title + " (" + section.status + ")");
    ensure(45);
    page.drawRectangle({ x: LEFT, y: y - 7, width: TEXT_WIDTH, height: 2, color: GOLD });
    y -= 21;
    writeParagraph(title, 12, GOLD, 10);
    writeParagraph(readableText(section.data), 9, INK, 6);
    if (section.limitations.length) writeParagraph("Limitations: " + section.limitations.join(" "), 8.5, MUTED, 13);
  }

  writeParagraph("Calculation status: " + status.status + ". Interpretations are for reflection and do not predict certain results.", 8.5, MUTED);

  for (const item of pdf.getPages()) {
    item.drawText("Naksharix  |  Internal reviewed report  |  Page " + (pdf.getPages().indexOf(item) + 1),
      { x: LEFT, y: 29, font, size: 8, color: MUTED });
  }
  const saved = await pdf.save({ useObjectStreams: true });
  const bytes = Buffer.from(saved);
  if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("PDF serialization returned an invalid document");
  }
  return {
    generated: true,
    status: "generated_internal_unverified",
    pdfUrl: null,
    bytes,
    byteLength: bytes.byteLength,
    deliveryEnabled: false,
    reason: "A real internal reviewed PDF with calculation limitations was generated for protected storage."
  };
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
