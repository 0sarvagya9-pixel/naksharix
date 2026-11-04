import "server-only";
import type { Prisma } from "@prisma/client";

/** The same calendar lock is used by creation and rescheduling. */
export async function lockConsultationCalendar(tx: Prisma.TransactionClient, profileId: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${profileId}), hashtext('consultation-calendar-v1'))::text AS locked`;
}

export async function hasConsultationConflict(
  tx: Prisma.TransactionClient, profileId: string, start: Date, durationMins: number, excludeId = ""
) {
  if (!Number.isFinite(start.getTime()) || !Number.isInteger(durationMins) || durationMins <= 0 || durationMins > 1440)
    throw new RangeError("Invalid consultation interval");
  const end = new Date(start.getTime() + durationMins * 60000);
  const rows = await tx.$queryRaw<Array<{ conflict: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM "ConsultationBooking"
      WHERE "astrologerProfileId" = ${profileId} AND "id" <> ${excludeId}
        AND "status"::text IN ('PENDING', 'REQUESTED', 'PAYMENT_PENDING', 'ACCEPTED', 'CONFIRMED', 'COMPLETED')
        AND "scheduledAt" < ${end}
        AND "scheduledAt" + GREATEST("durationMins", 1) * INTERVAL '1 minute' > ${start}
    ) AS conflict`;
  return rows[0]?.conflict !== false; // Unexpected response must not allow double booking.
}
