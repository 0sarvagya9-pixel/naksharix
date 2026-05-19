import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cacheGet, cacheSet } from "@/lib/cache";
import { cacheTtl, createHashKey, pdfCacheKey } from "@/lib/report-hash";
import type { KundliReport } from "@/lib/astrology/types";
import { renderBundledKundliPdf } from "@/lib/pdf/kundli-renderer";
import { logKundliPdfValidation, normalizeKundliPdfData } from "@/lib/kundli/pdf-data";
import { readLanguageFromRequest } from "@/lib/server-language";

const schema = z.object({
  report: z.record(z.unknown()),
  pdfType: z.enum(["FREE", "PREMIUM"]).default("FREE"),
  language: z.enum(["en", "hi", "hinglish"]).optional()
});

export async function POST(request: NextRequest) {
  let debugContext: Record<string, unknown> = {};
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody) || !("report" in rawBody)) {
      console.log("[Naksharix PDF] Missing report payload", {
        bodyKeys: rawBody && typeof rawBody === "object" && !Array.isArray(rawBody) ? Object.keys(rawBody) : [],
        reportExists: Boolean(rawBody && typeof rawBody === "object" && !Array.isArray(rawBody) && "report" in rawBody)
      });
      return NextResponse.json({ ok: false, error: "Missing kundli report payload" }, { status: 400 });
    }
    const parsed = schema.safeParse(rawBody);
    if (!parsed.success) {
      console.error("[Naksharix PDF] Invalid request body", parsed.error.flatten());
      return NextResponse.json({ ok: false, error: "Invalid PDF request body", details: parsed.error.flatten() }, { status: 400 });
    }
    const body = parsed.data;
    const reportPayload = unwrapReportPayload(body.report);
    const language = readLanguageFromRequest(request, body.language ?? (reportPayload as { language?: unknown }).language);
    const report = reportPayload as Partial<KundliReport>;
    debugContext = {
      pdfType: body.pdfType,
      language,
      reportKeys: Object.keys(body.report ?? {}),
      unwrappedReportKeys: Object.keys(reportPayload ?? {}),
      hasProfile: Boolean(report.profile),
      hasBirthDetails: Boolean(report.birthDetails),
      hasCharts: Boolean(report.charts),
      hasPlanetPositions: Array.isArray(report.planetPositions),
      planetCount: Array.isArray(report.planetPositions) ? report.planetPositions.length : 0
    };
    console.info("[Naksharix PDF] Incoming request", debugContext);
    if (!report.profile || !report.birthDetails) {
      console.error("[Naksharix PDF] Missing required report fields", debugContext);
      return NextResponse.json({ ok: false, error: "Missing kundli report payload", context: debugContext }, { status: 400 });
    }
    const reportHash = report.reportHash ?? createHashKey(reportPayload);
    const key = pdfCacheKey(`${reportHash}:${language}`, body.pdfType);
    const cached = await cacheGet<string>(key);
    if (cached) {
      return pdfResponse(Buffer.from(cached, "base64"));
    }
    console.info("[Naksharix PDF] Normalizing report data", debugContext);
    const kundliPdfData = normalizeKundliPdfData(report as KundliReport);
    logKundliPdfValidation(kundliPdfData);
    if (process.env.NODE_ENV === "development") {
      console.log("[Naksharix PDF] Before PDF generation", {
        bodyKeys: Object.keys(body),
        reportExists: Boolean(body.report),
        normalizedDataKeys: Object.keys(kundliPdfData)
      });
      console.log("PDF normalized keys:", Object.keys(kundliPdfData));
      console.log("PDF sample planet:", kundliPdfData.planetaryPositions?.[0]);
      findObjects(kundliPdfData);
    }
    console.info("[Naksharix PDF] Rendering PDF", {
      ...debugContext,
      d1Houses: kundliPdfData.d1Chart.length,
      d9Houses: kundliPdfData.d9Chart.length,
      chalitHouses: kundliPdfData.chalitChart.length,
      rahuKetuOpposite: kundliPdfData.validation.rahuKetuOpposite
    });
    const buffer = await renderKundliPdf(report as KundliReport, kundliPdfData, language, body.pdfType);
    console.info("[Naksharix PDF] PDF generated", { ...debugContext, bytes: buffer.length });
    await cacheSet(key, buffer.toString("base64"), cacheTtl.longTerm);
    return pdfResponse(buffer);
  } catch (error) {
    console.error("KUNDLI_PDF_ERROR_FULL:", error);

    const message = error instanceof Error ? error.message : String(error);

    const stack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        ok: false,
        route: "/api/kundli/pdf",
        error: message,
        stack: process.env.NODE_ENV === "development" ? stack : undefined
      },
      { status: 500 }
    );
  }
}

function unwrapReportPayload(report: Record<string, unknown>) {
  const nested = report.reportJson ?? report.report ?? report.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) return nested as Record<string, unknown>;
  return report;
}

function pdfResponse(body: Buffer | Uint8Array | ArrayBuffer) {
  const responseBody = body instanceof ArrayBuffer ? body : new Uint8Array(body);
  return new NextResponse(responseBody, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="naksharix-free-kundli-report.pdf"`,
      "Cache-Control": "no-store"
    }
  });
}

async function renderKundliPdf(report: KundliReport, kundliPdfData: ReturnType<typeof normalizeKundliPdfData>, language: "en" | "hi" | "hinglish", pdfType: "FREE" | "PREMIUM") {
  void report;
  return renderBundledKundliPdf(kundliPdfData, language, pdfType);
}

function findObjects(value: unknown, path = "root") {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => findObjects(item, `${path}[${index}]`));
    return;
  }
  Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
    if (nestedValue && typeof nestedValue === "object") {
      console.log("PDF_OBJECT_FIELD", `${path}.${key}`, nestedValue);
    }
    findObjects(nestedValue, `${path}.${key}`);
  });
}
