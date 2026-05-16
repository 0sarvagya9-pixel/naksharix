import { NextRequest, NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import React from "react";
import { z } from "zod";
import { KundliReportPdf } from "@/components/pdf/kundli-report-pdf";
import { fail, handleApiError, validateJson } from "@/lib/api";
import { cacheGet, cacheSet } from "@/lib/cache";
import { cacheTtl, createHashKey, pdfCacheKey } from "@/lib/report-hash";
import type { KundliReport } from "@/lib/astrology/types";
import { readLanguageFromRequest, translatedApiMessage } from "@/lib/server-language";

const schema = z.object({
  report: z.record(z.unknown()),
  pdfType: z.enum(["FREE", "PREMIUM"]).default("FREE"),
  language: z.enum(["en", "hi", "hinglish"]).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await validateJson(request, schema);
    const language = readLanguageFromRequest(request, body.language ?? (body.report as { language?: unknown }).language);
    const report = body.report as Partial<KundliReport>;
    if (!report.profile || !report.birthDetails) {
      return fail(translatedApiMessage(language, "pdfMissing"), 400);
    }
    const reportHash = report.reportHash ?? createHashKey(body.report);
    const key = pdfCacheKey(`${reportHash}:${language}`, body.pdfType);
    const cached = await cacheGet<string>(key);
    if (cached) {
      return pdfResponse(Buffer.from(cached, "base64"));
    }
    const document = React.createElement(KundliReportPdf, { report: report as KundliReport, pdfType: body.pdfType, language }) as React.ReactElement;
    const blob = await pdf(document as Parameters<typeof pdf>[0]).toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await cacheSet(key, buffer.toString("base64"), cacheTtl.longTerm);
    return pdfResponse(buffer);
  } catch (error) {
    if (error instanceof Error && /Invalid|Cannot read|undefined/i.test(error.message)) {
      return fail(translatedApiMessage(readLanguageFromRequest(request), "pdfFailed"), 400);
    }
    return handleApiError(error);
  }
}

function pdfResponse(body: BodyInit) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="naksharix-free-kundli-report.pdf"`,
      "Cache-Control": "no-store"
    }
  });
}
