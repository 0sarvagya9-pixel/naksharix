import { NextResponse } from "next/server";
import { authorizedRecoveryRequest, runDailyRecovery } from "@/lib/ops/daily-recovery";

/**
 * Production-only Vercel Cron. Authentication must be the current CRON_SECRET
 * supplied by Vercel as an Authorization: Bearer header. No public trigger,
 * no customer or backup bytes in response/logs, and no fake success receipt.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  if (!authorizedRecoveryRequest(request)) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } }
    );
  }

  try {
    const result = await runDailyRecovery();
    return NextResponse.json(
      {
        data: {
          state: "verified",
          day: result.receipt.day,
          restored: result.receipt.restored,
          encrypted: result.receipt.encrypted,
          privateStore: result.receipt.privateStore,
          emailAccepted: result.receipt.emailAccepted,
          unchanged: result.unchanged,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } }
    );
  } catch (error) {
    const category = error instanceof Error && /^BACKUP_[A-Z_]+$/.test(error.message)
      ? error.message
      : "BACKUP_FAILED_UNSPECIFIED";
    console.error("NAKSHARIX_RECOVERY_CRON_FAILED=" + category);
    return NextResponse.json(
      { error: "recovery_unavailable", code: category },
      { status: 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } }
    );
  }
}
