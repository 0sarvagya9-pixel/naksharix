import { NextResponse } from "next/server";
import { isAiAstrologerEnabled, isAiAstrologerReady } from "@/lib/ai/feature-status";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      data: {
        enabled: isAiAstrologerEnabled(),
        ready: isAiAstrologerReady()
      }
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
