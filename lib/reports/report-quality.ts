import { createHash } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import type { AstrologyLanguage } from "@/lib/astrology/types";
import type { PremiumReportContentResult, PremiumReportContentSection } from "./premium-report-content-engine";

type EvidenceInput = { slug: string; birth: unknown; extra: unknown; question: string; language: AstrologyLanguage };
export type ReportBinding = {
  version: 1; slug: string; language: AstrologyLanguage; inputHash: string;
  contentHash: string; calculationMethod: string; asOfUtc: string;
};
export class ReportQualityError extends Error {}

function reject(reason: string): never { throw new ReportQualityError("REPORT_QC_" + reason); }
function digest(value: unknown) {
  const canonical = JSON.stringify(value, (_key, object: unknown) => {
    if (!object || typeof object !== "object" || Array.isArray(object)) return object;
    return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  });
  return createHash("sha256").update(canonical).digest("hex");
}
export function reportQualityInputHash(input: EvidenceInput) {
  return digest({ slug: input.slug, birth: input.birth, extra: input.extra, question: input.question.trim(), language: input.language });
}
export function buildReportBinding(input: EvidenceInput, sections: PremiumReportContentSection[], asOf: Date, method: string): ReportBinding {
  return { version: 1, slug: input.slug, language: input.language, inputHash: reportQualityInputHash(input),
    contentHash: digest(sections), asOfUtc: asOf.toISOString(), calculationMethod: method };
}

const chapters: Record<string, readonly string[]> = {
  "premium-kundli": ["planets", "houses", "dasha", "panchang", "yoga-dosha", "numerology"],
  "couple-kundli": ["partner", "guna", "match-dosha", "compatibility-guidance"],
  "career-report": ["career-houses", "career-planets", "career-dasha", "career-plan"],
  "wealth-report": ["wealth-houses", "wealth-planets", "wealth-dasha", "money-plan"],
  "love-report": ["relationship-houses", "relationship-planets", "relationship-timing", "relationship-plan"],
  "baby-name-report": ["naming", "name-options", "birth-numerology"],
  "sade-sati-report": ["sade-sati-basis", "sade-sati-months", "sade-sati-guidance"],
  "manglik-kaal-sarp-report": ["dosha-positions", "manglik", "kaal-sarp", "dosha-guidance"],
  "numerology-lo-shu-report": ["numerology-profile", "lo-shu", "numerology-guidance"],
  "name-correction-report": ["current-name", "name-comparison", "name-guidance"],
  "yearly-horoscope-report": ["yearly-dasha", "yearly-months", "yearly-houses", "yearly-plan"],
  "transit-report": ["current-transit", "transit-months", "transit-context"],
  "rahu-ketu-report": ["natal-nodes", "node-transits", "node-guidance"],
  "jupiter-transit-report": ["natal-jupiter", "jupiter-transits", "jupiter-guidance"],
  "fortune-report": ["fortune-houses", "fortune-planets", "fortune-dasha", "fortune-plan", "lo-shu", "numerology-profile"]
};
type QualityRequest = { requestId: string; templateId: string; customerName?: string; language?: AstrologyLanguage; expectedInputHash?: string };
export function verifyReportContent(content: PremiumReportContentResult, request: QualityRequest) {
  const binding = content.metadata.binding;
  if (!binding || binding.version !== 1 || !request.requestId.trim()) reject("MISSING_BINDING");
  if (binding.slug !== request.templateId || binding.language !== request.language) reject("PRODUCT_LANGUAGE_MISMATCH");
  if (request.expectedInputHash !== undefined && request.expectedInputHash !== binding.inputHash) reject("INPUT_MISMATCH");
  if (!binding.calculationMethod || !Number.isFinite(Date.parse(binding.asOfUtc))) reject("CALCULATION_METHOD");
  const required = chapters[binding.slug];
  if (!required) reject("UNKNOWN_PRODUCT");
  const sections = new Map(content.sections.map(section => [section.key, section]));
  if (sections.size !== content.sections.length) reject("DUPLICATE_SECTION");
  for (const key of ["birth", "your-question", "editorial-insights", "editorial-depth", "trust", ...required]) {
    const section = sections.get(key);
    if (!section?.title.trim() || section.data == null || section.status === "blocked" || section.status === "unavailable") reject("SECTION_" + key);
  }
  const birth = sections.get("birth")?.data as { name?: string; generatedOn?: string };
  if (!request.customerName || birth.name?.normalize("NFC") !== request.customerName.normalize("NFC")) reject("CUSTOMER_MISMATCH");
  if (birth.generatedOn !== binding.asOfUtc.slice(0, 10)) reject("CALCULATION_DATE");
  if (digest(content.sections) !== binding.contentHash) reject("CONTENT_CHANGED");
  return "naksharix-royal-qc-v1-" + digest({ requestId: request.requestId, binding });
}
export async function verifyRoyalPdf(bytes: Uint8Array, receipt: string, title: string) {
  let document: PDFDocument;
  try { document = await PDFDocument.load(bytes, { updateMetadata: false }); } catch { return reject("PDF_UNREADABLE"); }
  if (document.getTitle() !== title || document.getKeywords() !== receipt) reject("PDF_BINDING");
  const pages = document.getPages();
  if (!pages.length || pages.some(page => !page.node.Contents() || Math.abs(page.getWidth()-595.28)>1 || Math.abs(page.getHeight()-841.89)>1)) reject("PDF_PAGE_STRUCTURE");
}
