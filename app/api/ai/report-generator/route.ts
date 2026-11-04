import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { aiFeatureParkedResponse, isAiReportGeneratorEnabled } from "@/lib/ai/feature-status";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { generateProfessionalReportDraft, ReportDraftUnavailableError } from "@/lib/ai/report-draft";

export const dynamic = "force-dynamic";

const schema = z.object({
  reportType: z.string().trim().min(2).max(80),
  clientName: z.string().trim().min(2).max(80),
  birthDetails: z.string().trim().min(5).max(500),
  focusQuestion: z.string().trim().min(5).max(500),
  language: z.enum(["English", "Hindi", "Hinglish"]).default("English")
}).strict();

export async function POST(request: NextRequest) {
  if (!isAiReportGeneratorEnabled()) return aiFeatureParkedResponse();

  try {
    const user = await getCurrentUser();
    if (!user || !["ASTROLOGER", "CONSULTANT", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return fail("Unauthorized", 403);
    }
    const input = await validateJson(request, schema);

    // A consistent production-wide generation budget is required even without
    // Redis. The claim logs only the user ID, never personal chart content.
    const claimed = await prisma.$transaction(async tx => {
      await tx.$queryRaw<Array<{ locked: string }>>`
        SELECT pg_advisory_xact_lock(hashtext(${user.id}), hashtext('ai-report-draft-quota'))::text AS locked
      `;
      const attempts = await tx.adminActionLog.count({
        where: {
          adminId: user.id,
          action: "ai.report.draft.attempt",
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
        }
      });
      if (attempts >= 4) return false;
      await tx.adminActionLog.create({
        data: {
          adminId: user.id,
          action: "ai.report.draft.attempt",
          targetType: "ProfessionalDraft",
          targetId: "noncommercial-draft",
          metadata: { dataStored: false, paidReportCreated: false }
        }
      });
      return true;
    });
    if (!claimed) return fail("Hourly professional draft limit reached. Try later.", 429);

    try {
      const draft = await generateProfessionalReportDraft(input);
      return ok({
        report: draft.text,
        status: draft.status,
        requiresHumanReview: draft.requiresHumanReview,
        verifiedChart: draft.verifiedChart,
        savedToReportRequest: false,
        customerDownloadAvailable: false,
        note: "AI working draft only. Actual chart calculation, operator review and separate paid report workflow remain mandatory."
      });
    } catch (error) {
      if (error instanceof ReportDraftUnavailableError) {
        return fail("AI draft provider could not generate a verified response. No report was created.", 503);
      }
      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
