import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont, type RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import regeneratorRuntime from "@babel/runtime/regenerator";
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
const LEFT = 48;
const RIGHT = 48;
const CONTENT_WIDTH = PAGE_WIDTH - LEFT - RIGHT;
const TOP = PAGE_HEIGHT - 48;
const FOOTER_TOP = 58;
const WINE = rgb(0.44, 0.15, 0.24);
const NAVY = rgb(0.063, 0.15, 0.247);
const GOLD = rgb(0.57, 0.40, 0.19);
const INK = rgb(0.17, 0.15, 0.18);
const MUTED = rgb(0.34, 0.34, 0.39);
const IVORY = rgb(1, 0.982, 0.956);
const WHITE = rgb(1, 1, 1);

function blocked(
  status: Exclude<PremiumReportGenerationResult["status"], "generated_internal_unverified">,
  reason: string
): PremiumReportGenerationResult {
  return { generated: false, status, pdfUrl: null, deliveryEnabled: false, reason };
}

/** Preserve every report field; no "first 14" or "first 22" silent truncation. */
function readableText(value: unknown, key = "", depth = 0): string {
  const prefix = key ? key + ": " : "";
  if (value === undefined || value === null) return prefix + "Unavailable";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return prefix + String(value);
  if (depth > 12) return prefix + "[Nested data exceeds 12 levels; manual review required]";
  if (Array.isArray(value)) {
    if (!value.length) return prefix + "No entries";
    return (key ? key + "\n" : "") + value.map((item, i) => readableText(item, String(i + 1), depth + 1)).join("\n");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return prefix + "No fields";
    return (key ? key + "\n" : "") + entries.map(([field, item]) => readableText(item, labelize(field), depth + 1)).join("\n");
  }
  return prefix + "Unsupported content type";
}

function labelize(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^./, first => first.toUpperCase());
}

type Fonts = { latin: PDFFont; indic: PDFFont };
type Run = { text: string; font: PDFFont };

async function loadReportFonts(pdf: PDFDocument): Promise<Fonts> {
  // pdf-lib's bundled fontkit needs the Babel regenerator runtime when shaping
  // Devanagari. Its absence previously broke mixed-script premium PDFs.
  const runtimeGlobal = globalThis as typeof globalThis & { regeneratorRuntime?: unknown };
  runtimeGlobal.regeneratorRuntime ??= regeneratorRuntime;
  pdf.registerFontkit(fontkit);
  const bytes = await readFile(path.join(process.cwd(), "public", "fonts", "NotoSansDevanagari-Regular.ttf"));
  return {
    latin: await pdf.embedFont(StandardFonts.Helvetica),
    indic: await pdf.embedFont(bytes, { subset: true })
  };
}

function safePrint(value: string): string {
  // Keep Hindi, ₹, degrees and readable punctuation. Replace unsupported
  // glyphs visibly instead of silently deleting prices or measurements.
  return String(value)
    .replace(/\r/g, "")
    .replace(/[–—−]/g, "-")
    .replace(/[‘’′]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\u00A0/g, " ")
    .replace(/[^\u0009\u000A\u0020-\u007E\u00A1-\u00FF\u0900-\u097F\u200C\u200D\u20B9]/gu, "?");
}

function graphemes(text: string): string[] {
  const segmenter = new Intl.Segmenter("hi", { granularity: "grapheme" });
  return Array.from(segmenter.segment(text), item => item.segment);
}

function fontRuns(value: string, fonts: Fonts): Run[] {
  const runs: Run[] = [];
  for (const cluster of graphemes(safePrint(value))) {
    const font = /[\u0900-\u097F\u200C\u200D\u20B9]/u.test(cluster) ? fonts.indic : fonts.latin;
    const last = runs[runs.length - 1];
    if (last && last.font === font) last.text += cluster;
    else runs.push({ font, text: cluster });
  }
  return runs;
}
function textWidth(value: string, fonts: Fonts, size: number): number {
  return fontRuns(value, fonts).reduce((width, run) => width + run.font.widthOfTextAtSize(run.text, size), 0);
}
function wrapLine(text: string, fonts: Fonts, size: number, maxWidth: number): string[] {
  const result: string[] = [];
  let line = "";
  const push = () => { result.push(line); line = ""; };
  for (const word of safePrint(text).trim().split(/\s+/u).filter(Boolean)) {
    const proposal = line ? line + " " + word : word;
    if (textWidth(proposal, fonts, size) <= maxWidth) { line = proposal; continue; }
    if (line) push();
    if (textWidth(word, fonts, size) <= maxWidth) { line = word; continue; }
    for (const piece of graphemes(word)) {
      if (line && textWidth(line + piece, fonts, size) > maxWidth) push();
      line += piece;
    }
  }
  if (line || !result.length) result.push(line);
  return result;
}
function drawTextRuns(page: PDFPage, value: string, x: number, y: number, size: number, fonts: Fonts, color: RGB) {
  let dx = x;
  for (const run of fontRuns(value, fonts)) {
    if (run.text.length) page.drawText(run.text, { x: dx, y, size, font: run.font, color });
    dx += run.font.widthOfTextAtSize(run.text, size);
  }
}

export async function generatePremiumReportPdf(request: PremiumReportGenerationRequest): Promise<PremiumReportGenerationResult> {
  const status = getPremiumEngineActivationStatus("pdf_generation");
  if (!request.content) return blocked("blocked_until_report_content", "Real chart-based report content is required.");
  if (!request.reviewedByAdmin) return blocked("blocked_until_admin_review", "Admin review is required before creating a report PDF.");

  const pdf = await PDFDocument.create();
  pdf.setTitle("NAKSHARIX Premium Report " + request.requestId);
  pdf.setAuthor("NAKSHARIX");
  pdf.setSubject("Admin-reviewed astrological working report; independent chart verification remains required");
  pdf.setLanguage("en-IN");
  const fonts = await loadReportFonts(pdf);
  let page: PDFPage;
  let y = TOP;
  const newPage = (cover = false) => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: IVORY });
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - (cover ? 151 : 42), width: PAGE_WIDTH, height: cover ? 151 : 42, color: NAVY });
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - (cover ? 151 : 42), width: PAGE_WIDTH, height: 3, color: GOLD });
    y = cover ? PAGE_HEIGHT - 58 : PAGE_HEIGHT - 76;
    if (!cover) drawTextRuns(page, "NAKSHARIX  /  PRIVATE REPORT", LEFT, PAGE_HEIGHT - 26, 10, fonts, WHITE);
  };
  newPage(true);
  const ensure = (required: number) => { if (y - required < FOOTER_TOP + 12) newPage(false); };
  const line = (text: string, size = 10.5, color: RGB = INK, lineHeight = 1.55, indent = 0) => {
    const height = size * lineHeight;
    ensure(height);
    drawTextRuns(page, text || " ", LEFT + indent, y, size, fonts, color);
    y -= height;
  };
  const paragraph = (value: string, size = 10.2, color: RGB = INK, after = 8, indent = 0) => {
    for (const rawLine of String(value).split(/\n/)) {
      const wrapped = wrapLine(rawLine, fonts, size, CONTENT_WIDTH - indent);
      for (const entry of wrapped) line(entry, size, color, 1.53, indent);
    }
    y -= after;
  };
  drawTextRuns(page, "NAKSHARIX", LEFT, PAGE_HEIGHT - 66, 23, fonts, WHITE);
  drawTextRuns(page, "PREMIUM VEDIC ASTROLOGY REPORT", LEFT, PAGE_HEIGHT - 97, 13, fonts, WHITE);
  drawTextRuns(page, "Private | Admin reviewed | Not independently chart-verified", LEFT, PAGE_HEIGHT - 126, 9.2, fonts, WHITE);
  y = PAGE_HEIGHT - 183;
  paragraph("Reference: " + request.requestId, 10.3, MUTED, 3);
  paragraph("Report: " + labelize(request.templateId), 10.3, MUTED, 14);
  paragraph("REPORT CONTENT", 14, WINE, 14);

  for (const section of request.content.sections) {
    ensure(77);
    page.drawRectangle({ x: LEFT, y: y + 2, width: CONTENT_WIDTH, height: 1.2, color: GOLD });
    y -= 19;
    paragraph(section.title, 12.2, WINE, 4);
    line("Verification status: " + section.status.replace(/_/g, " "), 8.4, MUTED, 1.6);
    y -= 7;
    paragraph(readableText(section.data), 10, INK, 12);
    if (section.limitations?.length) {
      paragraph("Limitations: " + section.limitations.join(" "), 9.1, MUTED, 13);
    }
  }
  paragraph("Calculation status: " + status.status.replace(/_/g, " ") +
    ". Interpretations are reflective guidance and not guaranteed predictions.", 9, MUTED, 8);
  const pages = pdf.getPages();
  for (let index = 0; index < pages.length; index++) {
    const current = pages[index];
    current.drawRectangle({ x: LEFT, y: 48, width: CONTENT_WIDTH, height: 0.7, color: GOLD });
    drawTextRuns(current, "NAKSHARIX  |  Private reviewed report", LEFT, 34, 8.2, fonts, MUTED);
    const pageNumber = String(index + 1) + " / " + String(pages.length);
    drawTextRuns(current, pageNumber, PAGE_WIDTH - RIGHT - textWidth(pageNumber, fonts, 8.2), 34, 8.2, fonts, MUTED);
  }

  const saved = await pdf.save({ useObjectStreams: true });
  const bytes = Buffer.from(saved);
  if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error("PDF serialization returned an invalid document");
  return {
    generated: true,
    status: "generated_internal_unverified",
    pdfUrl: null,
    bytes,
    byteLength: bytes.byteLength,
    deliveryEnabled: false,
    reason: "A readable admin-reviewed internal PDF was created. Independent chart verification and public delivery approval remain separate."
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
