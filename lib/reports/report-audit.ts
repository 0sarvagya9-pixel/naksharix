import "server-only";
import type { ReportRequestStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/monitoring/logger";

type Actor = {
  id?: string | null;
  role?: Role | string | null;
};

type SafeMetadata = Record<string, string | number | boolean | null | undefined>;

export async function writeAuditLog(input: {
  actor?: Actor | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: SafeMetadata;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actor?.id ?? null,
        actorRole: input.actor?.role ? String(input.actor.role) : null,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        metadata: input.metadata ?? undefined
      }
    });
  } catch {
    logger.warn("audit_log_write_failed", { action: input.action, targetType: input.targetType, targetId: input.targetId });
  }
}

export async function writeReportStatusHistory(input: {
  reportRequestId: string;
  oldStatus?: ReportRequestStatus | null;
  newStatus: ReportRequestStatus;
  actor?: Actor | null;
  note?: string | null;
  metadata?: SafeMetadata;
}) {
  try {
    await prisma.reportStatusHistory.create({
      data: {
        reportRequestId: input.reportRequestId,
        oldStatus: input.oldStatus ?? null,
        newStatus: input.newStatus,
        actorId: input.actor?.id ?? null,
        actorRole: input.actor?.role ? String(input.actor.role) : null,
        note: input.note ?? null,
        metadata: input.metadata ?? undefined
      }
    });
  } catch {
    logger.warn("report_status_history_write_failed", { reportRequestId: input.reportRequestId, newStatus: input.newStatus });
  }
}
