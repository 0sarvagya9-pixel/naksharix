import "server-only";
import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { lockProviderPayment } from "@/lib/payments/refund-evidence";
import { hasCurrentPaidReportEntitlement } from "@/lib/reports/paid-entitlement";
import { checkNewReportInputs } from "@/lib/reports/automatic-report-input";

export const correctionSchema = z.object({
  birth: z.unknown(), extra: z.unknown(), question: z.string().trim().max(2000),
  language: z.enum(["en", "hi", "hinglish"])
}).strict();

export function normalizedCorrection(slug: string, input: unknown) {
  const parsed = correctionSchema.safeParse(input);
  if (!parsed.success) return {ok:false as const, reason:"Check the corrected report details."};
  const {birth, extra, question, language} = parsed.data;
  const checked = checkNewReportInputs(slug, birth, extra);
  if (!checked.ok) return checked;
  return {ok:true as const, data:{birth:checked.birth, extra:checked.extra, question, language}};
}

export const revisionRequestSelection = {
  id:true, userId:true, paymentId:true, paymentStatus:true, status:true, reportSlug:true,
  adminBypass:true, generatedPdfSize:true, payment:{select:{providerPaymentId:true}}
} satisfies Prisma.ReportRequestSelect;

export type RevisionParent = Prisma.ReportRequestGetPayload<{select:typeof revisionRequestSelection}>;

export function correctionAvailable(parent: RevisionParent) {
  return !parent.adminBypass && Boolean(parent.generatedPdfSize || parent.status === "NEEDS_INFO");
}

// Match the original capture/refund lock order. Serialize version numbers on the
// parent request, even while two tabs submit different corrected inputs.
export async function lockRevisionParent(tx: Prisma.TransactionClient, parent: RevisionParent) {
  if (!parent.payment?.providerPaymentId || !parent.paymentId) return false;
  await lockProviderPayment(tx, parent.payment.providerPaymentId);
  await tx.$queryRaw`SELECT id FROM "Payment" WHERE id = ${parent.paymentId} FOR UPDATE`;
  await tx.$queryRaw`SELECT id FROM "ReportRequest" WHERE id = ${parent.id} FOR UPDATE`;
  return hasCurrentPaidReportEntitlement(parent, tx);
}

export async function proposeRevision(parent: RevisionParent, input: unknown) {
  const normalized = normalizedCorrection(parent.reportSlug, input);
  if (!normalized.ok) return {error:normalized.reason, status:422} as const;
  const json = JSON.stringify(normalized.data);
  const inputHash = createHash("sha256").update(json).digest("hex");
  return prisma.$transaction(async tx => {
    if (!await lockRevisionParent(tx, parent)) return {error:"A current purchase is required.", status:409} as const;
    const previous = await tx.reportRevision.findUnique({where:{reportRequestId_inputHash:{reportRequestId:parent.id,inputHash}},select:{version:true,status:true}});
    if (previous) return {revision:previous} as const;
    const latest = await tx.reportRevision.findFirst({where:{reportRequestId:parent.id},orderBy:{version:"desc"},select:{version:true,status:true}});
    if (latest && ["PENDING","GENERATING"].includes(latest.status)) return {error:"A correction is already awaiting review.",status:409} as const;
    const revision = await tx.reportRevision.create({data:{reportRequestId:parent.id, version:(latest?.version ?? 1)+1,
      inputHash, input:JSON.parse(json) as Prisma.InputJsonObject},select:{version:true,status:true}});
    await tx.reportStatusHistory.create({data:{reportRequestId:parent.id, actorId:parent.userId,
      oldStatus:parent.status, newStatus:parent.status, note:"Customer submitted corrected details for review.",metadata:{version:revision.version}}});
    return {revision} as const;
  });
}
