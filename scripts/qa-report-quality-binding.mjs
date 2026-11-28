import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { buildReportBinding, reportQualityInputHash, verifyReportContent, verifyRoyalPdf } from "../lib/reports/report-quality.ts";

const input = { slug: "career-report", language: "en", birth: { name: "Fictional A", dateOfBirth: "1990-01-01" }, extra: {}, question: "" };
const now = new Date("2026-11-26T12:00:00Z");
const keys = ["birth", "editorial-insights", "editorial-depth", "your-question", "trust", "career-houses", "career-planets", "career-dasha", "career-plan"];
const sections = keys.map((key, i) => ({ key, title: key, data: i ? { topic: key } : { ...input.birth, generatedOn: "2026-11-26" }, limitations: [], status: "available_unverified" }));
const binding = buildReportBinding(input, sections, now, "fixture-method-v1");
const content = { sections, metadata: { binding } };
const request = { requestId: "fictional-1", templateId: input.slug, customerName: input.birth.name, language: "en", expectedInputHash: reportQualityInputHash(input) };
const receipt = verifyReportContent(content, request);
assert.equal(reportQualityInputHash({ ...input, birth: { dateOfBirth: "1990-01-01", name: "Fictional A" } }), request.expectedInputHash);
assert.notEqual(verifyReportContent(content, { ...request, requestId: "fictional-2" }), receipt);
for (const [patch, reason] of [
  [{ expectedInputHash: reportQualityInputHash({ ...input, question: "Different" }) }, "INPUT_MISMATCH"],
  [{ customerName: "Fictional B" }, "CUSTOMER_MISMATCH"],
  [{ language: "hi" }, "PRODUCT_LANGUAGE_MISMATCH"],
  [{ templateId: "wealth-report" }, "PRODUCT_LANGUAGE_MISMATCH"],
  [{ requestId: "" }, "MISSING_BINDING"]
]) assert.throws(() => verifyReportContent(content, { ...request, ...patch }), new RegExp(reason));
assert.throws(() => verifyReportContent({ sections, metadata: {} }, request), /MISSING_BINDING/);
assert.throws(() => verifyReportContent({ ...content, sections: [...sections, sections[0]] }, request), /DUPLICATE_SECTION/);
assert.throws(() => verifyReportContent({ ...content, sections: sections.slice(0,-1) }, request), /SECTION_career-plan/);
assert.throws(() => verifyReportContent({ ...content, sections: sections.map(s => s.key === "career-plan" ? {...s, data:"Modified"} : s) }, request), /CONTENT_CHANGED/);
assert.throws(() => verifyReportContent({ ...content, sections: sections.map(s => s.key === "birth" ? {...s, data:{...s.data,generatedOn:"2020-01-01"}} : s) }, request), /CALCULATION_DATE/);
const pdf = await PDFDocument.create();
pdf.addPage([595.28,841.89]).drawText("Synthetic document");
pdf.setKeywords([receipt]);
pdf.setTitle("Fictional title");
const bytes = await pdf.save();
await verifyRoyalPdf(bytes, receipt, "Fictional title");
await assert.rejects(verifyRoyalPdf(bytes, "another-receipt", "Fictional title"), /PDF_BINDING/);
await assert.rejects(verifyRoyalPdf(bytes, receipt, "Other title"), /PDF_BINDING/);
await assert.rejects(verifyRoyalPdf(new Uint8Array([1,2,3]), receipt, "Fictional title"), /PDF_UNREADABLE/);
pdf.addPage([300,400]);
await assert.rejects(verifyRoyalPdf(await pdf.save(), receipt, "Fictional title"), /PDF_PAGE_STRUCTURE/);
console.log("PASS: normalized identity, request binding, five request mutations, five content mutations and five serialized PDF checks.");
