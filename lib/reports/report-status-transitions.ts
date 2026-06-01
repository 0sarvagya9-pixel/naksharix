import "server-only";
import { ReportPaymentStatus, ReportRequestStatus } from "@prisma/client";

type ReportTransitionContext = {
  hasPdf: boolean;
  paymentStatus: ReportPaymentStatus;
  adminBypass: boolean;
};

const allowedTransitions: Partial<Record<ReportRequestStatus, ReportRequestStatus[]>> = {
  RECEIVED: [ReportRequestStatus.PENDING_REVIEW, ReportRequestStatus.PAYMENT_PENDING, ReportRequestStatus.CANCELLED],
  PENDING_REVIEW: [
    ReportRequestStatus.PAYMENT_PENDING,
    ReportRequestStatus.PAID,
    ReportRequestStatus.IN_PROGRESS,
    ReportRequestStatus.NEEDS_INFO,
    ReportRequestStatus.CANCELLED
  ],
  PAYMENT_PENDING: [ReportRequestStatus.PAID, ReportRequestStatus.CANCELLED],
  PAID: [ReportRequestStatus.IN_PROGRESS, ReportRequestStatus.NEEDS_INFO, ReportRequestStatus.CANCELLED],
  IN_PROGRESS: [ReportRequestStatus.NEEDS_INFO, ReportRequestStatus.READY_FOR_GENERATION, ReportRequestStatus.CANCELLED],
  NEEDS_INFO: [ReportRequestStatus.IN_PROGRESS, ReportRequestStatus.CANCELLED],
  READY_FOR_GENERATION: [ReportRequestStatus.GENERATED, ReportRequestStatus.IN_PROGRESS, ReportRequestStatus.CANCELLED],
  GENERATED: [ReportRequestStatus.READY_FOR_DELIVERY, ReportRequestStatus.IN_PROGRESS, ReportRequestStatus.CANCELLED],
  READY_FOR_DELIVERY: [ReportRequestStatus.DELIVERED, ReportRequestStatus.CANCELLED],
  SENT: [ReportRequestStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: []
};

export function assertAllowedReportStatusTransition(
  from: ReportRequestStatus,
  to: ReportRequestStatus,
  context: ReportTransitionContext
) {
  if (from === to) return;
  const allowed = allowedTransitions[from] ?? [];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid report status transition from ${from} to ${to}.`);
  }
  if (to === ReportRequestStatus.PAID && !context.adminBypass && context.paymentStatus !== ReportPaymentStatus.PAID) {
    throw new Error("Verified payment or admin bypass is required before paid status can be set.");
  }
  if ((to === ReportRequestStatus.GENERATED || to === ReportRequestStatus.READY_FOR_DELIVERY || to === ReportRequestStatus.DELIVERED) && !context.hasPdf) {
    throw new Error("A real generated PDF is required before generation or delivery transitions.");
  }
  if (to === ReportRequestStatus.DELIVERED) {
    throw new Error("Delivered status must be set by the delivery service after a real delivery action.");
  }
}
